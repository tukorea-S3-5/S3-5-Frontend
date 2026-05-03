import { BLE_UUIDS, OnConnectionChange, OnHeartRateChange } from "./bleTypes";

class HeartRateBLEService {
  private device: BluetoothDevice | null = null;
  private commandCharacteristic: BluetoothRemoteGATTCharacteristic | null =
    null;

  // 외부(React Hook)에서 등록할 콜백 함수들
  private onHeartRateChangeCallback: OnHeartRateChange | null = null;
  private onConnectionChangeCallback: OnConnectionChange | null = null;

  // 콜백 등록 메서드
  public setCallbacks(
    onHeartRate: OnHeartRateChange,
    onConnection: OnConnectionChange,
  ) {
    this.onHeartRateChangeCallback = onHeartRate;
    this.onConnectionChangeCallback = onConnection;
  }

  // 블루투스 연결 시작 메서드
  public async connect(): Promise<void> {
    try {
      if (!navigator.bluetooth) {
        throw new Error(
          "이 브라우저는 Web Bluetooth API를 지원하지 않습니다. (크롬 권장)",
        );
      }

      // 기기 검색: 정의한 Service UUID를 가진 기기만 필터링해서 팝업에 띄웁니다.
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BLE_UUIDS.SERVICE] }],
      });

      // 기기 연결 끊김 이벤트 리스너 등록
      this.device.addEventListener(
        "gattserverdisconnected",
        this.handleDisconnected,
      );

      // GATT 서버 연결: 선택한 기기의 GATT 서버에 접속합니다.
      const server = await this.device.gatt?.connect();
      if (!server) throw new Error("GATT 서버에 연결할 수 없습니다.");

      // Service 가져오기: 아까 필터링했던 그 서비스를 서버에서 꺼내옵니다.
      const service = await server.getPrimaryService(BLE_UUIDS.SERVICE);

      // 심박수 Characteristic (Notify) 세팅
      // 아두이노에서 PROPERTY_NOTIFY로 설정한 특성을 가져옵니다.
      const heartRateChar = await service.getCharacteristic(
        BLE_UUIDS.HEART_RATE,
      );
      // 아두이노가 값을 보낼 때마다(notify) 이벤트를 수신하도록 활성화합니다.
      await heartRateChar.startNotifications();
      heartRateChar.addEventListener(
        "characteristicvaluechanged",
        this.handleHeartRateChanged,
      );

      // 명령 Characteristic (Write) 세팅
      // 진동을 켜고 끄기 위해 PROPERTY_WRITE로 설정한 특성을 저장해둡니다.
      this.commandCharacteristic = await service.getCharacteristic(
        BLE_UUIDS.COMMAND,
      );

      // 모든 연결이 성공하면 콜백을 통해 UI에 알림
      if (this.onConnectionChangeCallback)
        this.onConnectionChangeCallback(true);
    } catch (error) {
      console.error("블루투스 연결 에러:", error);
      throw error;
    }
  }

  // 블루투스 연결 해제 메서드
  public disconnect() {
    if (!this.device || !this.device.gatt?.connected) return;
    this.device.gatt.disconnect();
  }

  // 아두이노에서 Notify로 값이 넘어올 때마다 실행되는 함수
  private handleHeartRateChanged = (event: Event) => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (!value) return;

    // 아두이노에서 String(beatAvg).c_str()로 보낸 텍스트 데이터를 디코딩합니다.
    const decoder = new TextDecoder("utf-8");
    const bpmString = decoder.decode(value);
    const bpm = parseInt(bpmString, 10);

    if (this.onHeartRateChangeCallback) this.onHeartRateChangeCallback(bpm);
  };

  // 연결이 끊어졌을 때 실행되는 함수
  private handleDisconnected = () => {
    console.log("기기와 연결이 끊어졌습니다.");
    if (this.onConnectionChangeCallback) this.onConnectionChangeCallback(false);
  };

  // 진동 모터 제어 메서드 ('1' 또는 '0' 전송)
  public async vibrate(isOn: boolean) {
    if (!this.commandCharacteristic) {
      console.warn("진동 Characteristic이 연결되지 않았습니다.");
      return;
    }

    try {
      // 아두이노는 String 타입의 "1" 또는 "0"을 기다리고 있습니다.
      const commandString = isOn ? "1" : "0";
      const encoder = new TextEncoder();
      const data = encoder.encode(commandString);

      // 아두이노로 데이터 쓰기 (Write)
      await this.commandCharacteristic.writeValue(data);
    } catch (error) {
      console.error("명령 전송 실패:", error);
    }
  }
}

// 싱글톤 패턴으로 인스턴스를 하나만 생성하여 내보냅니다.
export const bleService = new HeartRateBLEService();
