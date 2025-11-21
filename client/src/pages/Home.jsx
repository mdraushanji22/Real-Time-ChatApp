import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const Home = () => {
  const { selectedUser } = useSelector((state) => state.chat);

  return (
    <>
      <div className="min-h-screen bg-gray-100 pt-16">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] px-2 sm:px-4 py-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-6xl h-full">
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar />
              {selectedUser ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
