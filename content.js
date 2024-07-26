// 创建加载动画元素
function createLoadingAnimation() {
  const loading = document.createElement('div');
  loading.id = 'loading-animation';
  loading.style.position = 'absolute';
  loading.style.width = '20px';
  loading.style.height = '20px';
  loading.style.borderRadius = '50%';
  loading.style.border = '3px solid rgba(0, 0, 0, 0.1)';
  loading.style.borderTop = '3px solid #3498db';
  loading.style.animation = 'spin 1s linear infinite';
  return loading;
}

// 添加CSS动画
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

async function getRandomUsernames(count) {
  let usernames = [];

  while (usernames.length < count) {
    // 生成随机数列表
    const uids = Array.from({ length: count - usernames.length }, () => Math.floor(Math.random() * (1000000000 - 100 + 1)) + 100);
    // 拼接随机数，用逗号分隔
    const uidsStr = uids.join(',');
    // API接口地址
    const apiUrl = `https://api.vc.bilibili.com/account/v1/user/cards?uids=${uidsStr}`;

    try {
      // 发送消息到background.js
      const newNames = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetchUsernames", url: apiUrl }, (response) => {
          if (response.success) {
            const names = response.data.data.map(user => user.name);
            resolve(names);
          } else {
            reject(response.error);
          }
        });
      });

      // 过滤掉包含bili或BILI的用户名
      const filteredNames = newNames.filter(name => !/bili/i.test(name));

      // 添加过滤后的用户名到最终的用户名列表
      usernames = usernames.concat(filteredNames);
    } catch (error) {
      console.error("Failed to fetch usernames:", error);
      // 可以在这里添加重试逻辑或其他错误处理
    }
  }

  // 返回数量满足要求的用户名
  return usernames.slice(0, count);
}

// 创建下拉框函数
async function createDropdown(inputElement, idCount) {
  // 移除之前的下拉框
  const existingDropdown = document.getElementById('random-string-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // 创建并添加加载动画
  const loading = createLoadingAnimation();
  inputElement.parentElement.style.position = 'relative';
  loading.style.left = `${inputElement.offsetLeft + inputElement.offsetWidth - 25}px`;
  loading.style.top = `${inputElement.offsetTop + (inputElement.offsetHeight / 2) - 10}px`;
  inputElement.parentElement.appendChild(loading);

  // 获取随机用户名
  const usernames = await getRandomUsernames(idCount);

  // 移除加载动画
  loading.remove();

  // 创建新的下拉框
  const dropdown = document.createElement('div');
  dropdown.id = 'random-string-dropdown';
  dropdown.style.position = 'absolute';
  dropdown.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  dropdown.style.backdropFilter = 'blur(10px)';
  dropdown.style.border = '1px solid #ccc';
  dropdown.style.zIndex = '1000';
  dropdown.style.width = `${inputElement.offsetWidth}px`;
  dropdown.style.borderRadius = '8px';

  // 将随机用户名添加到下拉框
  usernames.forEach(name => {
    const option = document.createElement('div');
    option.textContent = name;
    option.style.padding = '5px';
    option.style.cursor = 'pointer';
    option.style.borderBottom = '1px solid #ddd';
    option.addEventListener('click', () => {
      inputElement.value = name;
      const event = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(event);
      dropdown.remove();
    });
    dropdown.appendChild(option);
  });

  // 移除最后一个选项的下边框
  if (dropdown.lastChild) {
    dropdown.lastChild.style.borderBottom = 'none';
  }

  // 获取 input 元素的位置和尺寸
  const rect = inputElement.getBoundingClientRect();
  dropdown.style.left = `${rect.left + window.scrollX}px`;
  dropdown.style.top = `${rect.bottom + window.scrollY}px`;

  document.body.appendChild(dropdown);
}

// 监听所有 input 元素的 focus 事件
document.addEventListener('focusin', async (event) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'input') {
    const data = await new Promise(resolve => {
      chrome.storage.sync.get(['website', 'idCount'], resolve);
    });

    if (window.location.href.includes(data.website)) {
      createDropdown(target, parseInt(data.idCount, 10) || 5);
    }
  }
});

// 监听点击事件，点击其他地方时移除下拉框
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('random-string-dropdown');
  if (dropdown && !dropdown.contains(event.target) && event.target.tagName.toLowerCase() !== 'input') {
    dropdown.remove();
  }
});
