import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { UsersIcon, Settings, HomeIcon, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon, PlusIcon, Search, BellRing, LogOut } from "lucide-react";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="flex bg-base-100 h-screen overflow-hidden w-full text-base-content m-0 font-sans">
      
      {/* LEFT SIDEBAR - Contacts / Messages */}
      <div className="w-[340px] flex-shrink-0 border-r border-base-300 flex flex-col bg-white">
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div>
              <p className="font-semibold">{authUser?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-sm btn-circle btn-ghost text-primary text-2xl font-bold p-0 mb-1"><HomeIcon className="size-5" /></Link>
            <button className="btn btn-sm btn-circle btn-ghost text-orange-400"><Settings size={20}/></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 relative">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-orange-500">
            Messages <span className="text-xs text-base-content opacity-50 ml-1 mt-1">∨</span>
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-base-content opacity-50 size-4" />
            <input type="text" placeholder="Search here..." className="input input-sm h-10 w-full pl-10 bg-base-200 border-none rounded-full" />
          </div>
        </div>

        {/* Chats List (Visual Placeholder) */}
        <div className="flex-1 overflow-y-auto px-2 mt-4 space-y-2">
          {/* Active Chat Item */}
          <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-xl cursor-pointer">
            <div className="avatar placeholder">
               <div className="bg-neutral text-neutral-content w-10 h-10 rounded-full">
                 <span className="text-xl">TC</span>
               </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm truncate">Target Contact</h4>
                <span className="text-xs opacity-50">now</span>
              </div>
              <p className="text-xs text-primary truncate">Active chat...</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl cursor-pointer">
            <div className="avatar">
               <div className="w-10 h-10 rounded-full bg-blue-100">
               </div>
            </div>
            <div className="flex-1 overflow-hidden">
               <h4 className="font-bold text-sm truncate">UI/UX Designer</h4>
               <p className="text-xs text-primary truncate max-w-[200px]">Abel is typing...</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white">28</div>
          </div>
        </div>

        {/* Bottom player/status bar placeholder */}
        <div className="p-4 bg-primary/20 backdrop-blur-md rounded-tr-3xl">
           <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                 <div className="w-8 h-8 rounded-full bg-primary/50 relative"></div>
                 <p className="text-xs font-semibold text-primary">Status Active</p>
              </div>
           </div>
        </div>
      </div>


      {/* MIDDLE - STREAM CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-0 bg-base-200">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <div className="w-full h-full relative flex flex-col">
              <CallButton handleVideoCall={handleVideoCall} />
              <Window>
                <div className="bg-white/80 backdrop-blur border-b border-base-200">
                   <ChannelHeader />
                </div>
                <MessageList />
                <MessageInput focus />
              </Window>
            </div>
          </Channel>
        </Chat>
      </div>


      {/* RIGHT SIDEBAR - Group Details */}
      <div className="w-[320px] flex-shrink-0 border-l border-base-300 hidden xl:flex flex-col bg-white">
        
        {/* Header */}
        <div className="p-4 border-b border-base-200 flex justify-between items-center">
          <h2 className="font-bold text-lg">Group Details</h2>
          <button className="btn btn-sm btn-circle btn-ghost text-base-content opacity-50">×</button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Top Actions */}
          <div className="flex justify-between items-center mb-6">
            <button className="btn btn-square btn-outline btn-sm h-12 w-12 rounded-xl border-base-300"><BellRing className="size-5" /></button>
            <button className="btn btn-square btn-outline btn-sm h-12 w-12 rounded-xl border-base-300"><UsersIcon className="size-5" /></button>
            <button className="btn btn-square btn-sm h-12 w-12 rounded-xl bg-orange-100 text-orange-500 border-none"><span className="font-bold text-lg">!</span></button>
            <button className="btn btn-square btn-outline btn-sm h-12 w-12 rounded-xl border-base-300 text-red-500"><LogOut className="size-5" /></button>
          </div>

          {/* Notice Card */}
          <div className="bg-base-200 p-4 rounded-xl shadow-sm mb-6">
            <p className="text-sm font-semibold">Let's find out how to create the "good" UI/UX Design together!</p>
            <p className="text-xs opacity-60 mt-1">Created on 12/03/2021 by Mr.Knight</p>
          </div>

          {/* Media Section */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold text-lg">Photos <span className="font-normal text-sm opacity-50 ml-1">18</span></h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=200&h=200&fit=crop" className="w-full h-full object-cover" /></div>
              <div className="aspect-square bg-gray-200 rounded-xl flex flex-col gap-2">
                 <div className="h-1/2 bg-gray-300 rounded-t-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=100&fit=crop" className="w-full h-full object-cover" /></div>
                 <div className="h-1/2 flex gap-2">
                    <div className="w-1/2 bg-gray-400 rounded-bl-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1531297172867-4d5ceccd1e41?w=100&h=100&fit=crop" className="w-full h-full object-cover"/></div>
                    <div className="w-1/2 bg-gray-500 rounded-br-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=100&h=100&fit=crop" className="w-full h-full object-cover" /></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold text-lg">Videos <span className="font-normal text-sm opacity-50 ml-1">26</span></h3>
              <button className="text-xs text-orange-500 font-semibold hover:underline">See All</button>
            </div>
             <div className="grid grid-cols-2 gap-2">
              <div className="aspect-video bg-gray-200 rounded-xl flex items-end justify-end p-1 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494253109108-2e30c049369b?w=200&h=120&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
                <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-md relative z-10">1:32</span>
              </div>
              <div className="aspect-video bg-gray-200 rounded-xl flex items-end justify-end p-1 relative overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200&h=120&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
                <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-md relative z-10">2:15</span>
              </div>
             </div>
          </div>

          <div>
             <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold text-lg">Links <span className="font-normal text-sm opacity-50 ml-1">196</span></h3>
              <button className="text-xs text-orange-500 font-semibold hover:underline">See All</button>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center gap-3 p-2">
                 <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <LinkIcon className="size-5" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="font-bold text-sm">YouTube</p>
                    <p className="text-xs opacity-50 truncate">https://www.youtube.com/watch...</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 p-2">
                 <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <LinkIcon className="size-5" />
                 </div>
                 <div className="overflow-hidden">
                    <p className="font-bold text-sm">Dribbble</p>
                    <p className="text-xs opacity-50 truncate">https://dribbble.com/10am</p>
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
};
export default ChatPage;
