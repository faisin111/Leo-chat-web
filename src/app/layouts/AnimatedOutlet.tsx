import { useOutlet } from 'react-router-dom';

export function AnimatedOutlet() {
  const outlet = useOutlet();

  return <div className="w-full h-full flex-1 flex flex-col relative">{outlet}</div>;
}
