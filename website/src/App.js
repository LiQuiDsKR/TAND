import React from 'react';

function App() {
    const handleSendMessage = () => {
        const input = document.getElementById('chatInput');
        const chatRoom = document.querySelector('.overflow-y-auto');
        const message = document.createElement('p');
        message.textContent = input.value;
        chatRoom.appendChild(message);
        input.value = '';
    };

    return (
        <div className="bg-gray-100 text-gray-900 flex h-screen">
            {/* Sidebar */}
            <div className="w-1/4 bg-white shadow-lg p-4">
                <h1 className="text-2xl font-bold mb-4">TAND</h1>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">서울</h2>
                    <div className="border rounded-lg shadow-md p-4 mb-4 cursor-pointer">
                        <p className="text-sm">용산구</p>
                        <p className="font-bold">남산타워 야경투어</p>
                        <div className="bg-gray-200 h-32 mt-2"></div>
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-semibold">부산</h2>
                    <div className="border rounded-lg shadow-md p-4 cursor-pointer">
                        <p className="text-sm">수영구</p>
                        <p className="font-bold">광안리 해수욕장</p>
                        <div className="bg-gray-200 h-32 mt-2"></div>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center bg-white shadow-md p-4">
                    <a href="#" className="text-blue-500">Login</a>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <p className="text-lg font-semibold">2024년09월29일</p>
                    <div className="border rounded-lg p-4 mb-4">
                        <p className="font-bold">어디로 떠날까?</p>
                    </div>
                    <div className="border rounded-lg p-4 h-64 overflow-y-auto">
                        {/* Chat room content will appear here */}
                    </div>
                </div>
                <div className="flex items-center bg-white shadow-md p-4">
                    <input type="text" id="chatInput" className="flex-1 border rounded-lg p-2 mr-2" placeholder="여기에 입력해 주세요." />
                    <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded-lg p-2">Send</button>
                </div>
            </div>
        </div>
    );
}

export default App;
