import { useState, useEffect } from "react";
import styled from "styled-components";
import { Pencil } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Dot,
  Tooltip,
} from "recharts";
import { getJson, postJson, putJson } from "../../api/http";

type CardState = "input" | "saved" | "editing";

interface WeightLog {
  weight_log_id: number;
  pregnancy_id: number;
  week: number;
  weight: number;
  created_at: string;
}

interface WeightSummary {
  start_weight: number;
  current_weight: number;
  total_gain: number;
}

interface WeightResponse {
  summary: WeightSummary;
  logs: WeightLog[];
}

// 💡 백엔드 스펙에 맞춘 인터페이스 구조
interface WeightTrend {
  based_on?: string;
  slope?: number;
  slope_status?: string;
  current_position?: {
    range?: {
      min: number;
      max: number;
    };
    status?: string;
  };
  recommended_weekly_range?: {
    min: number;
    max: number;
  };
}

interface PregnancyInfo {
  week: number;
}

interface HealthReportResponse {
  report: string;
}

interface PregnancyInfo {
  week: number;
  bmi?: number;
}

type StatusType = "normal" | "excessive" | "warning";

const getStatusType = (status?: string): StatusType => {
  if (!status) return "warning";
  if (status.includes("정상")) return "normal";
  if (status.includes("과도") || status.includes("초과")) return "excessive";

  return "warning";
};

export default function WeightPage() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [cardState, setCardState] = useState<CardState>("input");
  const [inputValue, setInputValue] = useState("");
  const [editValue, setEditValue] = useState("");
  const [summary, setSummary] = useState<WeightSummary | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pregnancyError, setPregnancyError] = useState(false);
  const [trend, setTrend] = useState<WeightTrend | null>(null);
  const [healthReport, setHealthReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const fetchPregnancyInfo = async () => {
    try {
      const res = await getJson<PregnancyInfo>("/pregnancy/me");
      setCurrentWeek(res.week);
      setSelectedWeek(res.week);
      setPregnancyError(false);
      return res.week;
    } catch {
      setPregnancyError(true);
      throw new Error("임신 정보를 불러올 수 없습니다.");
    }
  };

  const fetchWeight = async (week?: number, bmi?: number) => {
    try {
      const [weightRes, trendRes] = await Promise.allSettled([
        getJson<WeightResponse>("/pregnancy/weight"),
        getJson<WeightTrend>("/pregnancy/weight-trend"),
      ]);

      if (weightRes.status === "fulfilled") {
        const data = weightRes.value;

        const mappedSummary: WeightSummary = {
          start_weight: data?.summary?.start_weight ?? 0,
          current_weight: data?.summary?.current_weight ?? 0,
          total_gain: data?.summary?.total_gain ?? 0,
        };

        const mappedLogs: WeightLog[] = (data?.logs ?? []).map((log: any) => ({
          weight_log_id: log.weight_log_id,
          pregnancy_id: log.pregnancy_id,
          week: log.week,
          weight: log.weight,
          created_at: log.created_at,
        }));

        setSummary(mappedSummary);
        setLogs(mappedLogs);

        const targetWeek = week ?? selectedWeek;
        const log = mappedLogs.find((l) => l.week === targetWeek);
        setCardState(log ? "saved" : "input");
      } else {
        setError("데이터를 불러오지 못했어요. 다시 시도해주세요.");
      }

      if (trendRes.status === "fulfilled") {
        const trendData = trendRes.value;

        const mappedTrend: WeightTrend = {
          based_on: trendData?.based_on ?? "",
          slope: trendData?.slope ?? 0,
          slope_status: trendData?.slope_status ?? "",
          current_position: trendData?.current_position,
          recommended_weekly_range: trendData?.recommended_weekly_range,
        };

        console.log("[trend response]", mappedTrend);
        setTrend(mappedTrend);

        const status = trendData?.current_position?.status || "정상 범위";
        setIsReportLoading(true);
        try {
          const aiRes = await postJson<HealthReportResponse>(
            "/ai/health-report",
            {
              week: week,
              bmi: bmi,
              weightStatus: status,
            },
          );
          setHealthReport(aiRes.report);
        } catch (e) {
          console.error("AI 리포트 호출 실패", e);
        } finally {
          setIsReportLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
      setError("데이터를 불러오는 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    setPregnancyError(false);
    setLoading(true);
    try {
      // 임신 정보를 가져와서 week와 bmi를 넘겨줌
      const res = await getJson<PregnancyInfo>("/pregnancy/me");
      setCurrentWeek(res.week);
      setSelectedWeek(res.week);

      const userBmi = res.bmi;
      await fetchWeight(res.week, userBmi);
    } catch {
      setPregnancyError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  const handleWeekChange = (week: number) => {
    if (isSubmitting) return;
    setSelectedWeek(week);
    setInputValue("");
    setEditValue("");
    setError(null);
    const log = logs.find((l) => l.week === week);
    setCardState(log ? "saved" : "input");
  };

  const thisWeekLog = logs.find((l) => l.week === selectedWeek);

  useEffect(() => {
    if (cardState === "saved" && !thisWeekLog) {
      setCardState("input");
    }
  }, [cardState, thisWeekLog]);

  const totalGain = summary?.total_gain != null ? summary.total_gain : null;
  const baseWeight =
    summary?.start_weight != null ? summary.start_weight : null;

  const chartData = [
    ...(baseWeight !== null ? [{ week: 0, weight: baseWeight }] : []),
    ...logs
      .slice()
      .sort((a, b) => a.week - b.week)
      .map((l) => ({ week: l.week, weight: l.weight })),
  ];

  const weights = chartData.map((d) => d.weight);
  const minW = weights.length ? Math.floor(Math.min(...weights)) - 2 : 40;
  const maxW = weights.length ? Math.ceil(Math.max(...weights)) + 2 : 90;

  const handleSave = async () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0 || isSubmitting || pregnancyError) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await postJson("/pregnancy/weight", { week: selectedWeek, weight: val });
      await fetchWeight(selectedWeek);
      setInputValue("");
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setEditValue(String(thisWeekLog?.weight ?? ""));
    setError(null);
    setCardState("editing");
  };

  const handleUpdate = async () => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0 || isSubmitting || pregnancyError) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await putJson(`/pregnancy/weight/${selectedWeek}`, { weight: val });
      await fetchWeight(selectedWeek);
      setEditValue("");
    } catch {
      setError("수정에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setCardState("saved");
  };

  if (loading)
    return (
      <Container>
        <LoadingText>불러오는 중...</LoadingText>
      </Container>
    );

  return (
    <Container>
      {/* 이번 주 요약 카드 */}
      <SummaryCard>
        <RecordTitle>이번 주 요약</RecordTitle>
        <MainStatArea>
          <StatTitle>현재까지 총 증가량</StatTitle>
          <StatValue>
            {totalGain !== null
              ? `${totalGain >= 0 ? "+" : ""}${totalGain.toFixed(1)}`
              : "-"}
            <span className="unit">kg</span>
          </StatValue>

          {trend?.current_position?.range && (
            <SubStatText>
              이번 주 목표: {trend.current_position.range.min} ~{" "}
              {trend.current_position.range.max}kg
              <StatusBadge
                statusType={getStatusType(trend.current_position.status)}
              >
                {trend.current_position.status}
              </StatusBadge>
            </SubStatText>
          )}
        </MainStatArea>

        {trend && (
          <TrendCard
            statusType={getStatusType(
              trend?.slope_status ?? trend?.current_position?.status,
            )}
          >
            <TrendRow>
              <TrendItem>
                <TrendLabel>최근 4주 평균 증가량</TrendLabel>
                <TrendValue accent>
                  {(trend.slope ?? 0).toFixed(2)}kg<TrendUnit>/주</TrendUnit>
                </TrendValue>
              </TrendItem>
              <TrendDivider />
              <TrendItem>
                <TrendLabel>임신 평균 권장 증가량</TrendLabel>
                <TrendValue>
                  {trend.recommended_weekly_range
                    ? `${trend.recommended_weekly_range.min.toFixed(2)} ~ ${trend.recommended_weekly_range.max.toFixed(2)}kg`
                    : "-"}
                  <TrendUnit>/주</TrendUnit>
                </TrendValue>
              </TrendItem>
            </TrendRow>
            <TrendStatus
              statusType={getStatusType(
                trend?.slope_status ?? trend?.current_position?.status,
              )}
            >
              {trend.slope_status ||
                trend.current_position?.status ||
                "상태 정보를 불러오는 중입니다."}
            </TrendStatus>
          </TrendCard>
        )}
        {isReportLoading ? (
          <AiReportCard>
            <AiIcon>⏳</AiIcon>
            <AiReportContent>
              <AiText style={{ color: "#8b7e74" }}>
                MOMI AI가 건강 리포트를 작성 중입니다...
              </AiText>
            </AiReportContent>
          </AiReportCard>
        ) : healthReport ? (
          <AiReportCard>
            <AiIcon>✨</AiIcon>
            <AiReportContent>
              <AiTitle>MOMI 주간 건강 리포트</AiTitle>
              <AiText>{healthReport}</AiText>
            </AiReportContent>
          </AiReportCard>
        ) : null}
      </SummaryCard>

      {/* 체중 기록 카드 */}
      <RecordCard>
        <WeekSelectRow>
          <RecordTitle>체중 기록</RecordTitle>
          <WeekSelect
            value={selectedWeek}
            onChange={(e) => handleWeekChange(Number(e.target.value))}
            disabled={isSubmitting}
            aria-label="주차 선택"
          >
            {Array.from({ length: currentWeek }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                {w}주차
              </option>
            ))}
          </WeekSelect>
        </WeekSelectRow>

        <label htmlFor="weight-input">
          <RecordSubLabel>현재 체중 (kg)</RecordSubLabel>
        </label>

        {cardState === "input" && (
          <>
            <Input
              id="weight-input"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="체중을 입력하세요"
              disabled={isSubmitting}
            />
            <ButtonRow>
              <PrimaryButton
                onClick={handleSave}
                disabled={isSubmitting || pregnancyError}
              >
                {isSubmitting ? "저장 중..." : "체중 기록하기"}
              </PrimaryButton>
            </ButtonRow>
          </>
        )}

        {cardState === "saved" && thisWeekLog && (
          <SavedRow>
            <SavedWeight
              aria-label={`${selectedWeek}주차 체중 ${thisWeekLog.weight}kg`}
            >
              {thisWeekLog.weight.toFixed(1)}
            </SavedWeight>
            <EditButton onClick={handleEdit} aria-label="체중 수정">
              <Pencil size={16} />
            </EditButton>
          </SavedRow>
        )}

        {cardState === "editing" && (
          <>
            <Input
              id="weight-input"
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              $focused
              disabled={isSubmitting}
            />
            <ButtonRow>
              <PrimaryButton
                onClick={handleUpdate}
                disabled={isSubmitting || pregnancyError}
              >
                {isSubmitting ? "저장 중..." : "저장하기"}
              </PrimaryButton>
              <SecondaryButton onClick={handleCancel} disabled={isSubmitting}>
                취소하기
              </SecondaryButton>
            </ButtonRow>
          </>
        )}

        {pregnancyError && (
          <ErrorText role="alert">
            임신 정보를 불러올 수 없어요.{" "}
            <RetryButton onClick={initializeData}>다시 시도</RetryButton>
          </ErrorText>
        )}
        {error && <ErrorText role="alert">{error}</ErrorText>}
      </RecordCard>

      {/* 체중 변화 추이 그래프 */}
      <ChartCard>
        <RecordTitle>체중 변화 추이</RecordTitle>
        <ChartMeta>
          {baseWeight !== null && <>시작 체중: {baseWeight}kg</>}
          {totalGain !== null && (
            <>
              {" "}
              | 현재 증가량:{" "}
              <Accent>
                {totalGain >= 0 ? "+" : ""}
                {totalGain.toFixed(1)}kg
              </Accent>
            </>
          )}
        </ChartMeta>

        <div
          role="img"
          aria-label="주차별 체중 변화 그래프 — 빨간선은 실제 측정 체중(kg)"
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e5" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#8b7e74" }}
                tickLine={false}
                tickFormatter={(value) =>
                  Number(value) === 0 ? "임신 전" : `${value}주`
                }
                label={{
                  value: "주차",
                  position: "insideBottomRight",
                  offset: -4,
                  fontSize: 10,
                  fill: "#8b7e74",
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8b7e74" }}
                tickLine={false}
                domain={[minW, maxW]}
                label={{
                  value: "kg",
                  angle: -90,
                  position: "insideLeft",
                  offset: 16,
                  fontSize: 10,
                  fill: "#8b7e74",
                }}
              />
              <Tooltip
                formatter={(v) => [`${v}kg`, "체중"]}
                labelFormatter={(l) =>
                  Number(l) === 0 ? "임신 전" : `${l}주차`
                }
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #f0e8e5",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ff5038"
                strokeWidth={2}
                dot={<Dot r={3} fill="#ff5038" stroke="#ff5038" />}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  box-sizing: border-box;
`;
const LoadingText = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RecordCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
`;
const RecordTitle = styled.p`
  ${({ theme }) => theme.typography.body1}
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;
const RecordSubLabel = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;
const Input = styled.input<{ $focused?: boolean }>`
  width: 100%;
  border: 1.5px solid
    ${({ theme, $focused }) =>
      $focused ? theme.colors.point : theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px ${({ theme }) => theme.spacing.md};
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  box-sizing: border-box;
  &:focus {
    border-color: ${({ theme }) => theme.colors.point};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const PrimaryButton = styled.button`
  flex: 1;
  height: 48px;
  background: ${({ theme }) => theme.colors.point};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover:not(:disabled) {
    filter: brightness(0.92);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const SavedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const SavedWeight = styled.span`
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
`;
const EditButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.subtext};
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.colors.point};
    color: ${({ theme }) => theme.colors.point};
  }
`;
const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: 4px;
`;
const SecondaryButton = styled.button`
  flex: 1;
  height: 48px;
  background: ${({ theme }) => theme.colors.light};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const ErrorText = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.point};
  margin: 4px 0 0 0;
`;
const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;
const ChartMeta = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;
const TrendCard = styled.div<{ statusType: StatusType }>`
  background: ${({ statusType }) =>
    ({
      normal: "#f0faf0",
      excessive: "#fff5f5",
      warning: "#fffbf0",
    })[statusType]};
  border: 1.5px solid
    ${({ statusType }) =>
      ({
        normal: "#a5d6a7",
        excessive: "#ffb3b3",
        warning: "#ffe082",
      })[statusType]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const TrendItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const TrendDivider = styled.div`
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.sub};
`;
const TrendLabel = styled.span`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
`;
const TrendValue = styled.span<{ accent?: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ accent, theme }) =>
    accent ? theme.colors.point : theme.colors.text.primary};
`;
const TrendUnit = styled.span`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.subtext};
  margin-left: 1px;
`;
const TrendStatus = styled.p<{ statusType: StatusType }>`
  ${({ theme }) => theme.typography.caption}
  font-weight: 600;
  margin: 0;
  color: ${({ statusType }) =>
    ({
      normal: "#2e7d32",
      excessive: "#c62828",
      warning: "#f57f17",
    })[statusType]};
`;
const Accent = styled.span`
  color: ${({ theme }) => theme.colors.point};
  font-weight: 700;
`;
const WeekSelectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;
const RetryButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.caption}
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;
const WeekSelect = styled.select`
  border: 1.5px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 4px 8px;
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.white};
  outline: none;
  cursor: pointer;
  &:focus {
    border-color: ${({ theme }) => theme.colors.point};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EarlyPregnancyTip = styled.div`
  background: #faf5f3;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 12px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.subtext || "#8b7e74"};
  border: 1px dashed ${({ theme }) => theme.colors.sub || "#f0e8e5"};
  margin-top: 4px;
`;

const StatusBadge = styled.span<{ statusType: StatusType }>`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 11px;
  font-weight: 700;
  background: ${({ statusType }) =>
    ({
      normal: "#e8f5e9",
      excessive: "#ffebee",
      warning: "#fff8e1",
    })[statusType]};
  color: ${({ statusType }) =>
    ({
      normal: "#2e7d32",
      excessive: "#c62828",
      warning: "#f57f17",
    })[statusType]};
`;

const MainStatArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 가운데 정렬로 시선 집중 */
  padding: ${({ theme }) => theme.spacing.lg} 0;
  gap: 8px;
`;

const StatTitle = styled.span`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.subtext};
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.point}; /* 메인 컬러로 포인트 */
  line-height: 1;

  .unit {
    font-size: 18px;
    font-weight: 600;
    margin-left: 4px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SubStatText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background};
  padding: 6px 12px;
  border-radius: 20px;
`;

// AI 리포트 스타일
const AiReportCard = styled.div`
  display: flex;
  gap: 12px;
  background: #f4f6ff; /* 은은한 AI 느낌의 연보라/연파랑 배경 */
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: 4px;
`;

const AiIcon = styled.div`
  font-size: 18px;
  line-height: 1;
  margin-top: 2px;
`;

const AiReportContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AiTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #6b46c1; /* 딥 퍼플 포인트 */
`;

const AiText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #4a5568;
  word-break: keep-all;
`;
