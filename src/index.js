import "./styles.css";
let onBoarding;
let session;

const container = document.getElementById("camera-container");

function createOnBoarding() {
  const apiURL = process.env.API_URL;
  const clientId = process.env.CLIENT_ID;
  return window.OnBoarding.create({
    clientId: clientId,
    apiURL: apiURL,
    theme: {
      // main: "",
      // mainButton: {
      //   borderRadius: "",
      //   color: "",
      //   border: "",
      // },
    },
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
  try {
    document.querySelector(".loading").style.display = "none";
    console.log("SDK loaded");
    onBoarding = createOnBoarding(); // initialize the instance
    container.innerHTML = `<p>Warming up...</p>`;
    await onBoarding.warmup();
    container.innerHTML = `<p>Creating session...</p>`;
    session = await createSession();
    await onBoarding
      .sendGeolocation({ token: session.token })
      .catch(console.log);
    container.innerHTML = "";
    renderFrontTutorial();
  } catch (e) {
    console.dir(e);
    container.innerHTML = `<p>Something went wrong</p>`;
    throw e;
  }
}

document.addEventListener("DOMContentLoaded", app);
