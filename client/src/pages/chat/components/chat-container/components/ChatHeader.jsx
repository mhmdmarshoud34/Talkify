import { useAppStore } from "@/store";
import { GoChevronLeft } from "react-icons/go";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center px-10 relative">
      <button
        className="absolute ml-3 left-0 text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        onClick={closeChat}
      >
        <GoChevronLeft className="text-3xl text-700" />
      </button>

      <div className="flex gap-3 items-center justify-center w-full">
        <div className="w-12 h-12 relative overflow-hidden">
          {selectedChatType === "contact" ? (
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {selectedChatData.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedChatData.color
                  )}`}
                >
                  {selectedChatData.firstName
                    ? selectedChatData.firstName.split("").shift()
                    : selectedChatData.email.split("").shift()}
                </div>
              )}
            </Avatar>
          ) : (
            <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
              #
            </div>
          )}
        </div>
        <span>
          {selectedChatType === "channel" && selectedChatData.name}
          {selectedChatType === "contact" && selectedChatData.firstName
            ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
            : selectedChatData.email}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
