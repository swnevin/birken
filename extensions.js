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
    max-width: 100%;
    margin: auto;
    padding: 0px;
    background-color: transparent;
    border-radius: 8px;
  }

  label {
    font-size: 1em;
    color: #333;
    display: block;
    margin: 10px 0 5px;
    font-weight: 500;
  }

  input[type="text"], input[type="email"], textarea {
    width: 100%;
    border: 2px solid #003677; /* Tykkere kant med ny farge */
    background-color: #fff;
    color: #333;
    margin: 10px 0;
    padding: 10px;
    outline: none;
    font-size: 1em;
    font-family: Arial, sans-serif; /* Bytter til Arial */
    border-radius: 8px; /* Avrundede hjørner */
    box-sizing: border-box;
  }

  textarea {
    height: 100px;
  }

  .invalid {
    border-color: red;
  }

  .submit {
    background-color: #003677; /* Ny farge */
    border: none;
    color: white;
    padding: 12px;
    border-radius: 8px; /* Avrundede hjørner */
    margin-top: 20px;
    width: 100%;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
  }
      </style>

      <label for="email">Mail</label>
      <input type="email" class="email" name="email" required
             pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
             title="Ugyldig e-post"><br><br>

      <label for="topic">Emne</label>
      <input type="text" class="topic" name="topic" required><br><br>

      <label for="userQuestion">Melding</label>
      <textarea class="userQuestion" name="userQuestion" required></textarea><br><br>

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
