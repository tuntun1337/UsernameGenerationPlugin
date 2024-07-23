document.getElementById('saveSettings').addEventListener('click', () => {
  const website = document.getElementById('website').value;
  const idCount = document.getElementById('idCount').value;

  chrome.storage.sync.set({
    website: website,
    idCount: idCount
  }, () => {
    alert('Settings saved!');
  });
});

// 加载当前设置
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['website', 'idCount'], (data) => {
    document.getElementById('website').value = data.website || 'http://127.0.0.1:14250/';
    document.getElementById('idCount').value = data.idCount || 5;
  });
});
