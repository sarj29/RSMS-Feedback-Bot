(() => {
  const STORAGE_KEY = "rsmsFeedbackAutomation";

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function subjectSelect() {
    return document.querySelector('select[name="Subject_Code"]');
  }

  function subjectOptions() {
    const select = subjectSelect();
    if (!select) return [];
    return [...select.options]
      .map((o, index) => ({
        index,
        value: o.value,
        text: o.textContent.trim()
      }))
      .filter(o => o.value && !o.disabled);
  }

  function fillOptionOne() {
    const groups = new Map();

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      if (!radio.name) return;
      if (!groups.has(radio.name)) groups.set(radio.name, []);
      groups.get(radio.name).push(radio);
    });

    let selected = 0;

    for (const group of groups.values()) {
      // The first radio in each name-group is Option 1 on this form.
      const first = group[0];
      if (first && !first.disabled) {
        first.checked = true;
        first.dispatchEvent(new Event("input", {bubbles:true}));
        first.dispatchEvent(new Event("change", {bubbles:true}));
        first.click();
        selected++;
      }
    }
    return selected;
  }

  function fillRequiredTextareas() {
    const textareas = [...document.querySelectorAll("textarea")];

    // The page exposes exactly two textareas: 11446 and 11447.
    // Keep the selectors explicit so unrelated textareas aren't touched.
    const targets = textareas.filter(t =>
      t.name === "11446" || t.name === "11447"
    );

    // Fallback only if the names ever change: use the two textareas.
    const finalTargets = targets.length === 2 ? targets : textareas.slice(0, 2);

    let filled = 0;
    for (const t of finalTargets) {
      if (!t.value.trim()) {
        t.value = " ";
        t.dispatchEvent(new Event("input", {bubbles:true}));
        t.dispatchEvent(new Event("change", {bubbles:true}));
        filled++;
      }
    }
    return filled;
  }

  function fillCurrent() {
    const radios = fillOptionOne();
    const textareas = fillRequiredTextareas();
    return {radios, textareas};
  }

  function submitFeedback() {
    const button =
      document.querySelector('input[type="submit"][name="B1"]') ||
      document.querySelector('input[type="submit"][value="SUBMIT FEEDBACK"]');

    if (!button) {
      return {success:false, message:"Submit Feedback button not found."};
    }

    button.click();
    return {success:true, message:"Submit Feedback clicked."};
  }

  async function getState() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  }

  async function setState(state) {
    await chrome.storage.local.set({[STORAGE_KEY]: state});
  }

  async function clearState() {
    await chrome.storage.local.remove(STORAGE_KEY);
  }

async function startAll() {
    const options = subjectOptions();

    if (!options.length) {
        console.warn("RSMS: no subject options found.");
        return;
    }

    let state = await getState();

    // First time starting the automation
    if (!state) {
        state = {
            running: true,
            index: 0,
            submittedIndex: null,
            startedAt: Date.now()
        };

        await setState(state);
    }

    if (!state.running) {
        return;
    }

    /*
     * If the previous subject was submitted and the page
     * reloaded, move to the next subject.
     */
    if (state.submittedIndex === state.index) {

        state.index += 1;
        state.submittedIndex = null;

        await setState(state);
    }

    /*
     * Only say "all complete" AFTER the final subject
     * has actually been submitted.
     */
    if (state.index >= options.length) {

        await clearState();

        alert("RSMS: all listed subjects are complete.");

        return;
    }

    const target = options[state.index];
    const select = subjectSelect();

    if (!select) {

        await clearState();

        alert(
            "RSMS: subject dropdown not found. Automation stopped."
        );

        return;
    }

    console.log(
        `RSMS: processing ${state.index + 1}/${options.length}: ${target.text}`
    );

    /*
     * IMPORTANT:
     * Do NOT increment index here.
     *
     * We keep the same index until submission succeeds.
     */
    await setState({
        ...state,
        running: true,
        currentSubject: target.text,
        currentValue: target.value
    });

    // Select the subject
    if (select.value !== target.value) {

        select.value = target.value;

        select.dispatchEvent(
            new Event("input", {
                bubbles: true
            })
        );

        select.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

        await sleep(800);
    }

    // Fill all Option 1 answers + both textareas
    const result = fillCurrent();

    console.log(
        "RSMS: filled",
        result
    );

    // Give the page time to register the values
    await sleep(700);

    // Submit the current subject
    const submit = submitFeedback();

    console.log(
        "RSMS:",
        submit
    );

    if (!submit.success) {

        await clearState();

        alert(
            "RSMS: could not find the Submit Feedback button. Automation stopped."
        );

        return;
    }

    /*
     * Submission succeeded.
     *
     * Mark this subject as submitted.
     *
     * If the page reloads, the script will run again,
     * see submittedIndex === index, and move to the
     * next subject.
     */
    await setState({
        ...state,
        running: true,
        submittedIndex: state.index,
        currentSubject: target.text,
        currentValue: target.value
    });
}

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
      if (message.command === "fill_current") {
        const r = fillCurrent();
        sendResponse({
          success:true,
          message:`Selected Option 1 for ${r.radios} question(s) and filled ${r.textareas} required text field(s).`
        });
        return;
      }

      if (message.command === "submit_current") {
        sendResponse(submitFeedback());
        return;
      }

      if (message.command === "start_all") {
        // Start asynchronously; popup gets an immediate acknowledgement.
        startAll();
        sendResponse({
          success:true,
          message:"Automation started. Keep this RSMS tab open."
        });
        return;
      }

      if (message.command === "stop") {
        await clearState();
        sendResponse({success:true, message:"Automation stopped."});
        return;
      }
    })();

    return true;
  });

  // If a subject change caused a full page reload, continue automatically.
  (async () => {
    await sleep(400);
    const state = await getState();
    if (state?.running) {
      console.log("RSMS: continuing saved automation state.");
      await startAll();
    }
  })();
})();