import "./styles.css";
let onBoarding;
let session;

const container = document.getElementById("camera-container");

function createOnBoarding() {
  const apiURL = "youApiUrl";
  const clientId = "yourClientId";
  return window.OnBoarding.create({
    clientId: clientId,
    apiURL: apiURL,
  });
}

function createSession() {
  return onBoarding.createSession("ALL");
}

function showError() {
  alert("Some error");
}

function renderFrontTutorial() {
  onBoarding.renderFrontTutorial(container, {
    onSuccess: renderFrontIDCamera,
    noWait: true,
  });
}

function renderFrontIDCamera() {
  onBoarding.renderCamera("front", container, {
    onSuccess: (result) => renderBackIDCamera(),
    onError: showError,
    token: session,
    numberOfTries: -1,
    noWait: true,
  });
}

function renderBackIDCamera() {
  onBoarding.renderCamera("back", container, {
    onSuccess: processId,
    onError: showError,
    token: session,
    numberOfTries: -1,
  });
}

function processId() {
  container.innerHTML = "<p>Loading...</p>";
  onBoarding.processId({ token: session.token }).then(() => {
    container.innerHTML = "";
    renderPoa();
  });
}

function renderPoa() {
  onBoarding.renderCamera("document", container, {
    onSuccess: renderSelfieCamera,
    onError: showError,
    numberOfTries: 3,
    onLog: () => {},
    token: session,
    permissionBackgroundColor: "#696969",
    sendBase64: false,
    nativeCamera: false,
  });
}

function renderSelfieCamera() {
  onBoarding.renderCamera("selfie", container, {
    onSuccess: () => {
      renderSignature();
    },
    onError: showError,
    token: session,
    numberOfTries: 3,
  });
}

function renderSignature() {
  onBoarding.renderSignature(container, {
    onSuccess: renderVideoConference,
    token: session.token,
  });
}

function renderVideoConference() {
  onBoarding.renderConference(
    container,
    {
      token: session,
      showOTP: true,
    },
    {
      onSuccess: (status) => {
        console.log("success");
        container.innerHTML = `<p>Success with status ${status}</p>`;
      },
      onError: (error) => {
        console.log("error", error);
        container.innerHTML = `<p>Success with status ${error}</p>`;
      },
      onLog: (...params) => console.log("onLog", ...params),
    }
  );
}

async function app() {
  onBoarding = createOnBoarding(); // initialize the instance
  container.innerHTML = `<p>Warming up...</p>`;
  let t0 = performance.now();
  await onBoarding.warmup();
  let t1 = performance.now();
  console.log("Call to warm up model took " + (t1 - t0) + " milliseconds.");
  container.innerHTML = `<p>Creating session...</p>`;
  t0 = performance.now();
  session = await createSession();
  await onBoarding.sendGeolocation({ token: session.token }).catch(console.log);
  t1 = performance.now();
  console.log("Creating session took " + (t1 - t0) + " milliseconds.");
  container.innerHTML = "";
  renderFrontTutorial();
}

document.addEventListener("DOMContentLoaded", app);
