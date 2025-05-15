import React, { useState } from 'react';

function App() {
    const [word, setWord] = useState('');

    const handleSearch = () => {
        // Implementation of handleSearch function
    };

    return (
        <div className="App">
            <div className="nav-bar">
                <div className="title">树根单词</div>
                <div className="nav-icons">
                    <div className="icon-more">•••</div>
                    <div className="icon-share">○</div>
                </div>
            </div>

            <div className="content-area">
                <div className="input-area">
                    <input
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder="请输入内容"
                        className="main-input"
                    />
                </div>

                {/* 这里可以放置搜索结果 */}
            </div>

            <div className="bottom-button-container">
                <button onClick={handleSearch} className="confirm-button">
                    确定
                </button>
            </div>
        </div>
    );
}

export default App; 