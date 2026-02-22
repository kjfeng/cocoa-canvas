import { useEffect } from 'react';
import Canvas from './components/Canvas/Canvas';
import UserNameModal from './components/UserNameModal';
import { useUserStore } from './store/userStore';
import { initSync } from './collaboration/syncBridge';

export default function App() {
  const isNameSet = useUserStore((s) => s.isNameSet);

  useEffect(() => {
    initSync();
  }, []);

  return (
    <>
      <Canvas />
      {!isNameSet && <UserNameModal />}
    </>
  );
}
