const buildUrl = "UnityBuild/Build";
const loaderUrl = buildUrl + "/UnityBuild.loader.js";
const config = {
    arguments: [],
    dataUrl: buildUrl + "/UnityBuild.data.unityweb",
    frameworkUrl: buildUrl + "/UnityBuild.framework.js.unityweb",
    codeUrl: buildUrl + "/UnityBuild.wasm.unityweb",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DefaultCompany",
    productName: "Leaner3D",
    productVersion: "0.1",
    // showBanner: unityShowBanner,
};
const canvas = document.querySelector("#unity-canvas");
const unityContainerDiv = document.getElementById("unity-container");
const closePopupDiv = document.getElementById("close-popup");

var _unityInstance = null;
let doShowComment = true;
let doAllowCommentVisibilityControl = true;

if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
{
    // Mobile device style: fill the whole browser client area with the game canvas:
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    document.getElementsByTagName('head')[0].appendChild(meta);
    document.querySelector("#unity-container").className = "unity-mobile";
    canvas.className = "unity-mobile";

}
else
{
    // Desktop style: Render the game canvas in a window that can be maximized to fullscreen:
    canvas.style.width = "960px";
    canvas.style.height = "600px";
}

function loadUnityInstance ()
{
    if (_unityInstance) return;

    var script = document.createElement("script");
    script.src = loaderUrl;
    script.onload = async () => {
        _unityInstance =  await createUnityInstance(canvas, config);
    }
    
    // Fire the onload function
    document.body.appendChild(script);
}

function requestLoadStep (stepIndex)
{
    var loadConfig = {};
    loadConfig.stepIndex = stepIndex;
    loadConfig.doShowComment = doShowComment;
    loadConfig.doAllowCommentVisibilityControl = doAllowCommentVisibilityControl;
    
    var loadConfig_JSON = JSON.stringify(loadConfig);
    _unityInstance.SendMessage("JSInterface", "RequestLoadStep", loadConfig_JSON);

}

function requestUnloadStep ()
{
   _unityInstance.SendMessage("JSInterface", "RequestUnloadStep");
}

function addEventsForList ()
{
    const liElements = document.getElementsByClassName("step-li");

    for (const li of liElements)
    {
        li.onclick = () => {

            const stepIndex = Number(li.dataset.stepIndex);

            if (!_unityInstance) {
                window.addEventListener('unitySceneLoaded', () => requestLoadStep(stepIndex));   
                loadUnityInstance();
            }
            else
            {
                requestLoadStep(stepIndex)
            }

            showUnityPopup();
        }
    }
}

function showUnityPopup()
{
    unityContainerDiv.style.opacity = "0";
    setTimeout(() => unityContainerDiv.style.opacity = "1", 500);
    
    unityContainerDiv.style.display = "block";
    
    closePopupDiv.style.opacity = "0";
    setTimeout(() => closePopupDiv.style.opacity = "1", 500);

    closePopupDiv.style.display = "flex";
}

function hideUnityPopup()
{
    unityContainerDiv.style.opacity = "1";
    setTimeout(() => unityContainerDiv.style.opacity = "0", 500);

    setTimeout(() => unityContainerDiv.style.display = "none", 1000);

    
    closePopupDiv.style.opacity = "1";
    setTimeout(() => closePopupDiv.style.opacity = "0", 500);

    setTimeout(() => unityContainerDiv.style.display = "none", 1000);

}

function onUnitySceneLoaded()
{
    console.log("onUnitySceneLoaded");
    //alert(`Scene loaded!`);
}

function onUnityStepLoaded (event)
{    
    console.log("onUnityStepLoaded: ", event);
    var data = JSON.parse(event.detail);
    //alert(`Step ${data.stepIndex} loaded!`);
}

function onUnityStepUnloaded (event)
{
    console.log("onUnityStepUnloaded: ", event);
    var data = JSON.parse(event.detail);
    //alert(`Step ${data.stepIndex} ended!`);
}

closePopupDiv.addEventListener('click', hideUnityPopup);
window.addEventListener('load', addEventsForList)
window.addEventListener('unitySceneLoaded', onUnitySceneLoaded);
window.addEventListener('unityStepLoaded', onUnityStepLoaded);
window.addEventListener('unityStepUnloaded', onUnityStepUnloaded);

function onKeyDown (event) {
    switch (event.code) {

        case 'KeyF':
            event.preventDefault();
            if (_unityInstance) _unityInstance.SetFullscreen(1);
                
            break;

        default:
            break;
    }
}
document.addEventListener('keydown', onKeyDown)
