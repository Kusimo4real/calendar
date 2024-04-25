'use client'
import { useEffect, useState } from "react";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
} from "@chatscope/chat-ui-kit-react";
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { UserCircleIcon, DotsVerticalIcon } from '@heroicons/react/outline';

export default function Home() {
    const [sessionID, setSessionID] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    let sessionStarted = false;

    useEffect(() => {
        if (sessionStarted) return;
        sessionStarted = true;
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_PREFIX}/chat/create_session`)
            .then(response => response.json())
            .then(data => {
                setSessionID(data.session_id);
                setChatMessages(prevMessages => [...prevMessages, { sender: "Assistant", message: data.response, sentTime: "just now", direction: "incoming" }]); // 将服务端返回的第一句话加入聊天框
            });
    }, []);

    const handleSendMessage = () => {
        setChatMessages(prevMessages => [...prevMessages, { sender: "Me", message: inputMessage, sentTime: "just now", direction: "outgoing" }]);
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_PREFIX}/chat/reply/${sessionID}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ reply: inputMessage })
        })
            .then(response => response.json())
            .then(data => {
                setChatMessages(prevMessages => [...prevMessages, { sender: "Assistant", message: data.response, sentTime: "just now", direction: "incoming" }]); // 将服务端返回的回复加入聊天框
            });
        setInputMessage("");
    }

    return (
        <>
            <main className="flex justify-center items-center h-screen">
                <div className="p-4 shadow-md w-96 rounded-lg">
                    <div className="flex items-center justify-between p-2 bg-gray-200 rounded-t-lg">
                        <div className="flex items-center">
                            <UserCircleIcon className="h-8 w-8 mr-2"/>
                            <h2 className="text-xl font-semibold">As</h2>
                        </div>
                        <div>
                            <DotsVerticalIcon className="h-6 w-6"/>
                        </div>
                    </div>
                    <div style={{position: "relative", height: "500px"}}>
                        <MainContainer>
                            <ChatContainer>
                                <MessageList>
                                    {chatMessages.map((chat, index) => (
                                        <Message key={index} model={chat}/>
                                    ))}
                                </MessageList>
                                <MessageInput
                                    placeholder="Type message here"
                                    attachButton={false}
                                    value={inputMessage}
                                    onSend={handleSendMessage}
                                    onChange={setInputMessage}
                                />
                            </ChatContainer>
                        </MainContainer>
                    </div>
                </div>
            </main>
            <footer className="bg-gray-200 py-4 text-center">
                <p>© 2023 YourCompanyName. All Rights Reserved</p>
            </footer>
        </>
    );
}
