const updatePopup = (message) => {
  const views = chrome.extension.getViews({
    type: "popup"
  })
  views.forEach((view) => {
    view.document.getElementById('msg').innerHTML = message;
  });
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