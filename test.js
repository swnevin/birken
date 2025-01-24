// This extension shows a waiting animation with customizable text and delay
// Also checking for the vf_done value to stop/hide the animation if it's true
const WaitingAnimationExtension = {
  name: 'WaitingAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_waitingAnimation' || trace.payload?.name === 'ext_waitingAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true
    await new Promise((resolve) => setTimeout(resolve, 250))

    const text = trace.payload?.text || 'Please wait...'
    const delay = trace.payload?.delay || 3000

    const waitingContainer = document.createElement('div')
    waitingContainer.innerHTML = `
      <style>
        .vfrc-message--extension-WaitingAnimation {
          background-color: transparent !important;
          background: none !important;
        }
        .waiting-animation-container {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #fffc;
          display: flex;
          align-items: center;
        }
        .waiting-text {
          display: inline-block;
          margin-left: 10px;
        }
        .waiting-letter {
          display: inline-block;
          animation: shine 1s linear infinite;
        }
        @keyframes shine {
          0%, 100% { color: #fffc; }
          50% { color: #000; }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #fffc;
          border-top: 2px solid #CF0A2C;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div class="waiting-animation-container">
        <div class="spinner"></div>
        <span class="waiting-text">${text
          .split('')
          .map((letter, index) =>
            letter === ' '
              ? ' '
              : `<span class="waiting-letter" style="animation-delay: ${
                  index * (1000 / text.length)
                }ms">${letter}</span>`
          )
          .join('')}</span>
      </div>
    `

    element.appendChild(waitingContainer)

    window.voiceflow.chat.interact({
      type: 'continue',
    })

    let intervalCleared = false
    window.vf_done = false

    const checkDoneInterval = setInterval(() => {
      if (window.vf_done) {
        clearInterval(checkDoneInterval)
        waitingContainer.style.display = 'none'
        window.vf_done = false
      }
    }, 100)

    setTimeout(() => {
      if (!intervalCleared) {
        clearInterval(checkDoneInterval)
        waitingContainer.style.display = 'none'
      }
    }, delay)
  },
}

// This extension triggers a "done" action,
// typically used to signal the completion of a task
// and hide a previous WaitingAnimation
const DoneAnimationExtension = {
  name: 'DoneAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_doneAnimation' || trace.payload?.name === 'ext_doneAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true
    await new Promise((resolve) => setTimeout(resolve, 250))

    window.voiceflow.chat.interact({
      type: 'continue',
    })
  },
}


const FormExtension = {
  name: 'Forms',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'Custom_Form' || trace.payload.name === 'Custom_Form',
  render: ({ trace, element }) => {
    const formContainer = document.createElement('form');

    formContainer.innerHTML = `
      <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
      form {
      font-family: 'Roboto', sans-serif;
      max-width: 85%;
      margin: auto;
      padding: 8px;
      background-color: transparent;
      border-radius: 8px;
    }

    label {
      font-size: 0.7em; /* Justert til lik størrelse som chatten */
      color: #333;
      display: block;
      margin: 6px 0 3px;
      font-weight: 500;
    }

    input[type="text"], input[type="email"], textarea {
      width: 100%;
      border: 1px solid #003677;
      background-color: #fff;
      color: #333;
      margin: 6px 0;
      padding: 6px;
      outline: none;
      font-size: 0.7em; /* Justert til lik størrelse som chatten */
      font-family: Arial, sans-serif;
      border-radius: 6px;
      box-sizing: border-box;
    }

    textarea {
      height: 70px;
    }

    .invalid {
      border-color: red;
    }

    .submit {
      background-color: #003677;
      border: none;
      color: white;
      padding: 8px;
      border-radius: 6px;
      margin-top: 12px;
      width: 100%;
      cursor: pointer;
      font-size: 0.7em; /* Justert til lik størrelse som chatten */
      font-weight: 500;
    }
      </style>

      <label for="email">Mail</label>
      <input type="email" class="email" name="email" required
             pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
             title="Ugyldig e-post"><br>

      <label for="topic">Emne</label>
      <input type="text" class="topic" name="topic" required><br>

      <label for="userQuestion">Melding</label>
      <textarea class="userQuestion" name="userQuestion" required></textarea><br>

      <input type="submit" class="submit" value="Send">
    `;

    // Prefill the form fields with the variables from trace.payload
    const emailInput = formContainer.querySelector('.email');
    const topicInput = formContainer.querySelector('.topic');
    const userQuestionInput = formContainer.querySelector('.userQuestion');

    emailInput.value = trace.payload.email || '';
    topicInput.value = trace.payload.topic || '';
    userQuestionInput.value = trace.payload.userQuestion || '';

    formContainer.addEventListener('input', function () {
      // Remove 'invalid' class when input becomes valid
      if (emailInput.checkValidity()) emailInput.classList.remove('invalid');
      if (topicInput.checkValidity()) topicInput.classList.remove('invalid');
      if (userQuestionInput.checkValidity()) userQuestionInput.classList.remove('invalid');
    });

    formContainer.addEventListener('submit', function (event) {
      event.preventDefault();

      if (
        !emailInput.checkValidity() ||
        !topicInput.checkValidity() ||
        !userQuestionInput.checkValidity()
      ) {
        if (!emailInput.checkValidity()) emailInput.classList.add('invalid');
        if (!topicInput.checkValidity()) topicInput.classList.add('invalid');
        if (!userQuestionInput.checkValidity()) userQuestionInput.classList.add('invalid');
        return;
      }

      formContainer.querySelector('.submit').remove();

      window.voiceflow.chat.interact({
        type: 'complete',
        payload: {
          email: emailInput.value,
          topic: topicInput.value,
          userQuestion: userQuestionInput.value,
        },
      });
    });

    element.appendChild(formContainer);
  },
};









<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Birken Testside</title>
   <link rel="icon" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSDC4VpqH2oT2HdcETwcLzLrEdAOQjR5QOyg&s" type="image/png">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: url('https://i.postimg.cc/zG5pXtRW/Skjermbilde-2025-01-20-134431.png') no-repeat center center fixed;
      background-size: cover;
      font-family: Arial, sans-serif;
    }

    .content {
      text-align: center;
      color: white;
      padding: 20px;
      background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay for readability */
      margin: 50px auto;
      max-width: 800px;
      border-radius: 10px;
    }

    @media (max-width: 768px) {
      body {
        background-size: cover;
      }

      .content {
        margin: 20px;
        padding: 15px;
      }
    }

    @media (max-width: 480px) {
      .content {
        margin: 10px;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <script src="https://swnevin.github.io/birken/extensions.js"></script>
  <script type="text/javascript">
    let proactiveMessage = "Hei, jeg hjelper deg gjerne!👋";

    (function(d, t) {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        window.voiceflow.chat.load({
          verify: { projectID: '678e2b0cc281e62ca5f3d6da' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          allowDangerousHTML: true,
          assistant: {
            extensions: [FormExtension, WaitingAnimationExtension, DoneAnimationExtension]
          }
        }).then(() => {
          console.log('Voiceflow widget loaded successfully');
          window.voiceflow.chat.proactive.clear();
          window.voiceflow.chat.proactive.push(
            { type: 'text', payload: { message: proactiveMessage } }
          );
        }).catch((err) => console.error('Widget load failed:', err));
      };
      v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
      v.type = "text/javascript";
      s.parentNode.insertBefore(v, s);
    })(document, 'script');
  </script>
</body>
</html>
