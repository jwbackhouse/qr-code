const updatePopup = ({type, message}) => {
  const [popup] = chrome.extension.getViews({
    type: "popup"
  })
  
  if (type === 'start') {
    setTimeout(() => {
      popup.document.getElementById('animation').style.display = 'flex';
    }, 750);
  }

  if (type === 'end') {
    popup.document.getElementById('msg').innerHTML = message;
    popup.document.getElementById('animation-container').remove();
    loadingElement.style.maxHeight = '0';
  }
};

const messageListener = (message) =>
  updatePopup(message);
  
chrome.runtime.onMessage.addListener(messageListener);

const injectContentScript = (tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['content.js']
  });
};

const getCurrentTab = async () => {
  let queryOptions = { active: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
  
getCurrentTab().then((tab)=>{
  injectContentScript(tab);
});