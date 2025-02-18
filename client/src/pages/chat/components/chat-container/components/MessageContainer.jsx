import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={message._id}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDM(message)}
          {selectedChatType === "channel" && renderCM(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    const response = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
  };

  const renderDM = (message) => {
    const isSender =
      message.sender.toString() === selectedChatData._id.toString();

    return (
      <div className={`${isSender ? "text-left" : "text-right"}`}>
        {message.messageType === "text" && (
          <div
            className={`${
              isSender
                ? "bg-[#1b1c24] text-white/80 border-white/20"
                : "bg-[#8417ff] text-white border-white/25"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              isSender
                ? "bg-[#1b1c24] text-white/80 border-white/20"
                : "bg-[#8417ff] text-white border-white/25"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  className="h-300 w-300"
                  alt=""
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-white/8 bg-black/20 rounded-full p-2 sm:p-1 md:p-2 lg:p-3 sm:text-base md:text-xl lg:text-2xl">
                  <MdFolderZip />
                </span>
                <span className="truncate text-sm sm:text-xs md:text-sm lg:text-base">
                  {message.fileUrl.split("/").pop()}
                </span>
                <span
                  className="bg-black/20 p-2 sm:p-1 md:p-2 lg:p-3 rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 sm:text-base md:text-xl lg:text-2xl"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-white/60 mt-1 mb-5">
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    );
  };

  const renderCM = (message) => {
    return (
      <div
        className={`mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id !== userInfo.id
                ? "bg-[#2a2b33] text-white/80 border-white/20"
                : "bg-[#8417ff]/5 text-white/90 border-[#8417ff]/50"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words ml-9`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id !== userInfo.id
                ? "bg-[#2a2b33]/5 text-white/80 border-white/20"
                : "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}/${message.fileUrl}`}
                  className="h-300 w-300"
                  alt=""
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-white/8 bg-black/20 rounded-full p-2 sm:p-1 md:p-2 lg:p-3 sm:text-base md:text-xl lg:text-2xl">
                  <MdFolderZip />
                </span>
                <span className="truncate text-sm sm:text-xs md:text-sm lg:text-base">
                  {message.fileUrl.split("/").pop()}
                </span>
                <span
                  className="bg-black/20 p-2 sm:p-1 md:p-2 lg:p-3 rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300 sm:text-base md:text-xl lg:text-2xl"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {message.sender.image && (
                <AvatarImage
                  src={`${HOST}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}
              <AvatarFallback
                className={`uppercase h-8 w-8 text-lg flex items-center justify-center rounded-full ${getColor(
                  message.sender.color
                )}`}
              >
                {message.sender.firstName
                  ? message.sender.firstName.split("").shift()
                  : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1 mb-5">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full bg-[#2a2b33]"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[100] top-0 left-0 h-[100vh] w-[100vw] flex flex-col items-center justify-center backdrop-blur-lg bg-black/50">
          <div className="flex justify-center gap-5 mb-4">
            <button
              className="bg-black/20 p-2 text-lg sm:text-xl md:text-2xl lg:text-3xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-2 text-lg sm:text-xl md:text-2xl lg:text-3xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
          <div className="flex justify-center items-center">
            <img
              src={`${HOST}/${imageURL}`}
              className="max-h-[80vh] max-w-[90vw] sm:max-h-[70vh] sm:max-w-[80vw] md:max-h-[60vh] md:max-w-[70vw] rounded-lg object-contain"
              alt="Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
