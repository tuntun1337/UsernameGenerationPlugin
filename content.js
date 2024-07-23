// 随机用户名生成函数
async function getRandomUsernames(count) {
  // 生成对应数量的随机数，从100到1000000000
  const uids = Array.from({ length: count }, () => Math.floor(Math.random() * (1000000000 - 100 + 1)) + 100);
  // 拼接随机数，用逗号分隔
  const uidsStr = uids.join(',');
  // API接口地址
  const apiUrl = `https://api.vc.bilibili.com/account/v1/user/cards?uids=${uidsStr}`;
  const referer = "https://www.bilibili.com";  // 替换为你需要的Referer

  // 发送消息到background.js
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "fetchUsernames", url: apiUrl, referer: referer }, (response) => {
      if (response.success) {
        const names = response.data.data.map(user => user.name);
        resolve(names);
      } else {
        reject(response.error);
      }
    });
  });
}

// 创建下拉框函数
async function createDropdown(inputElement, idCount) {
  // 移除之前的下拉框
  const existingDropdown = document.getElementById('random-string-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  // 获取随机用户名
  const usernames = await getRandomUsernames(idCount);

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
