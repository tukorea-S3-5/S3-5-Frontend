import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DeviceConnection from './components/DeviceConnection';

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

interface LocationState {
  exercises: Exercise[];
}

export default function ExercisePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { exercises } = (location.state as LocationState) ?? { exercises: [] };

  const [isConnecting, setIsConnecting] = useState(true); 

  const handleConnected = () => {
    setIsConnecting(false);
    // navigate('/exercise/running', { state: { exercises } }) 운동 실행 페이지
  };

  return (
    <div className="size-full">
      <DeviceConnection
        isOpen={isConnecting}
        onConnected={handleConnected}
        onCancel={() => navigate(-1)} // 취소 시 이전 페이지(ExerciseListPage)로
      />
      {/* Render exercises to use the variable */}
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <strong>{exercise.title}</strong>: {exercise.description}
          </li>
        ))}
      </ul>
    </div>
  );
}