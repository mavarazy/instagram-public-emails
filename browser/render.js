const domEls = {};

function renderTemplate() {
  const container = document.createElement('div');
  container.innerHTML =`
    <div class='x-wrap'>
      <div class='x-title'>
        1 .Search images by tag/location or go to user page
        <br />
        2. Press "start" to begin emails collecting proccess
      </div>

      <div class='x-btn-wrap'>
        <button class='x-btn x-to-csv' id="to-csv" onclick='saveTextareaToCSV()'>save to CSV</button>
        <button class='x-btn x-stop' id="stop" onclick='stop()'>stop</button>
        <button class='x-btn x-start' id="start" onclick='start()'>start</button>

        <div class="spinner" id="spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      </div>

      <h3 class='x-count'>found emails = <span id='total'>0</span></h3>

      <div>
        <textarea  id='result' class='x-emails'></textarea>
      </div>
    </div>
    <style>
      .x-wrap {
        padding: 20px;
      }
      .x-title {
        line-height: 1.3;
      }
      .x-btn-wrap {
        margin: 20px 0;
        position: relative;
        display: block;
      }
        .x-btn {
          width: 100px;
          display: inline-block;
          padding: 5px;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 1em;
          cursor: pointer;
          margin: 0 10px;
        }
        .x-btn:active {
          box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.6);
          opacity: 0.7;
        }
        .x-btn:disabled {
          background: #c3c3c3;
          cursor: default;
        }
        .x-start {
          background: green;
        }
        .x-stop {
          background: red;
          float: right;
        }
        .x-to-csv {
          background: blue;
          float: right;
        }
      .x-count {}
      .x-emails {
        width: 100%;
        height: 200px;
      }

      .spinner {
        width: 70px;
        text-align: center;
        display: inline-block;
      }

      .spinner > div {
        width: 18px;
        height: 18px;
        background-color: #003569;

        border-radius: 100%;
        display: inline-block;
        animation: sk-bouncedelay 1.4s infinite ease-in-out both;
      }

      .spinner .bounce1 {
        animation-delay: -0.32s;
      }

      .spinner .bounce2 {
        animation-delay: -0.16s;
      }

      @keyframes sk-bouncedelay {
        0%, 80%, 100% {
          transform: scale(0);
        } 40% {
          transform: scale(1.0);
        }
      }
    </style>
  `;
  document.body.insertBefore( container, document.body.firstChild );

  Object.assign(domEls, {
    total: document.getElementById('total'),
    result: document.getElementById('result'),
    spinner: document.getElementById('spinner'),
    stop: document.getElementById('stop'),
    start: document.getElementById('start')
  })
}


function syncStateWithTemplate(state) {
  domEls.total.innerHTML = state.total;
  domEls.result.value = state.csv;
  domEls.spinner.style.opacity = state.isRunning ? '1' : '0';
  domEls.stop.disabled = !state.isRunning
  domEls.start.disabled = state.isRunning;
}

module.exports = {
  renderTemplate, syncStateWithTemplate
};
