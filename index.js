
import Dialog from '@vant/weapp/dialog/dialog';

// 定义机器人头像路径常量
const BOT_AVATAR_SRC = '/images/logo.jpg';
const USER_AVATAR_SRC = '/images/校徽.jpg';

Page({
  data: {
    inputValue: '',
    loading: false,
    chatHistory: [],
    scrollToView: 'bottom-anchor',
    botAvatarSrc: BOT_AVATAR_SRC,
    userAvatarSrc: USER_AVATAR_SRC,
  },
  
  onLoad() {
    // 添加欢迎消息到聊天历史
    // 注意：已在WXML中静态添加，这里不需要重复添加
  },

  // 清除页面内容
  clearPage() {
    this.setData({
      inputValue: '',
      chatHistory: []
    });
    // 如果有定时器，清除它
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  },

  // 输入框值变化处理函数
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 确认按钮点击事件
  onConfirmClick() {
    const userInput = this.data.inputValue.trim();
    if (!userInput) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }
    
    // 添加用户消息到聊天历史
    const chatHistory = [...this.data.chatHistory]; // 创建副本
    
    // 添加用户消息
    chatHistory.push({
      type: 'user',
      content: userInput,
      id: 'user-' + Date.now(), // 使用前缀确保ID唯一
      isThinking: false
    });
    
    // 先更新UI显示用户消息
    this.setData({
      chatHistory: chatHistory,
      inputValue: ''
    });
    
    // 延迟添加机器人消息，确保用户消息已经显示
    setTimeout(() => {
      // 重新获取最新的聊天历史
      const updatedChatHistory = [...this.data.chatHistory];
      // 添加机器人消息并获取正确的索引
      const botMessageIndex = updatedChatHistory.length;
      
      // 添加机器人消息
      updatedChatHistory.push({
        type: 'bot',
        content: '', // 空内容
        id: 'bot-' + Date.now(), // 使用前缀确保ID唯一
        isThinking: true
      });
      
      this.setData({
        chatHistory: updatedChatHistory,
        scrollToView: 'bottom-anchor'
      });
      
      // 调用API，使用正确的索引
      this.callCozeWorkflow(userInput, botMessageIndex);
    }, 100);
  },

  // 模拟打字机效果
  startTypingEffect(text, messageIndex) {
    console.log('开始打字效果，消息索引:', messageIndex, '文本长度:', text ? text.length : 0);
    
    if (!text) {
      this.updateBotMessage(messageIndex, '无数据');
      return;
    }

    // 立即更新消息内容
    this.updateBotMessage(messageIndex, '');
    
    let index = 0;
    const speed = 50; // 每50毫秒输出一个字，约等于每秒20个字
    
    // 清除可能存在的旧定时器
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
    }
    
    // 创建新的定时器
    this.typingTimer = setInterval(() => {
      if (index < text.length) {
        this.updateBotMessage(messageIndex, text.substring(0, index + 1));
        index++;
        
        // 滚动到底部
        this.setData({
          scrollToView: 'bottom-anchor'
        });
      } else {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
        this.updateBotMessage(messageIndex, text);
        console.log('打字效果完成');
      }
    }, speed);
  },
  
  // 更新机器人消息
  updateBotMessage(index, content) {
    // 创建聊天历史的副本
    const newChatHistory = [...this.data.chatHistory];
    
    if (index >= 0 && index < newChatHistory.length) {
      // 创建消息对象的副本并更新
      const updatedMessage = {
        ...newChatHistory[index],
        content: content,
        type: 'bot',
        isThinking: false
      };
      
      // 替换原消息
      newChatHistory[index] = updatedMessage;
      
      // 更新状态
      this.setData({ 
        chatHistory: newChatHistory,
        scrollToView: 'bottom-anchor'
      });
      
      // 打印日志，帮助调试
      console.log('更新消息:', index, content ? content.substring(0, 20) + '...' : '空内容');
    } else {
      console.error('无效的消息索引:', index, '聊天历史长度:', newChatHistory.length);
    }
  },

  // 调用Coze工作流
  callCozeWorkflow(userInput, botMessageIndex) {
    wx.request({
      url: 'https://api.coze.cn/v1/workflow/run',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer pat_ohiJF5W341C4rtyQnbOFyPicR4wmaWBOKBucCftx9lFi3oeXEGeml9X389PpHGON'
      },
      data: {
        workflow_id: '7479332859150368809',
        bot_id: '7479331687332544539',
        parameters: {
          title: userInput || "import"
        }
      },
      success: (res) => {
        console.log("Coze工作流调用成功", res.data);
        setTimeout(() => {
          this.setData({ 
            loading: false,
            isThinking: false
          });
          
          // 提取answer字段的内容
          const responseData = JSON.parse(res.data.data).answer || '无数据';
          console.log('API返回数据:', responseData.substring(0, 50) + '...');
          
          // 开始打字机效果
          this.startTypingEffect(responseData, botMessageIndex);
        }, 500);
      },
      fail: (err) => {
        console.error("调用失败", err);
        this.setData({ loading: false });
        this.updateBotMessage(botMessageIndex, '操作失败：' + err.errMsg);
      }
    });
  }
});
