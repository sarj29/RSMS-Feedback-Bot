async function command(command) {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab?.id) return {success:false, message:"No active tab."};
  try {
    return await chrome.tabs.sendMessage(tab.id, {command});
  } catch (e) {
    return {success:false, message:"Open the RSMS Feedback page first."};
  }
}

function status(message) {
  document.getElementById("status").textContent = message;
}

document.getElementById("fill").onclick = async () => {
  const r = await command("fill_current");
  status(r?.message || "Done.");
};

document.getElementById("submit").onclick = async () => {
  if (!confirm("Submit the current feedback form?")) return;
  const r = await command("submit_current");
  status(r?.message || "Done.");
};

document.getElementById("all").onclick = async () => {
  const ok = confirm(
    "This will fill and submit every subject currently listed in the Subject Name dropdown. Continue?"
  );
  if (!ok) return;
  const r = await command("start_all");
  status(r?.message || "Automation started.");
};

document.getElementById("stop").onclick = async () => {
  const r = await command("stop");
  status(r?.message || "Stopped.");
};

document
    .getElementById("startCourseFeedback")
    .addEventListener("click", async () => {

        const confirmed = confirm(
            "Start Course Feedback automation?\n\n" +
            "It will select Excellent for each question " +
            "and automatically continue through the questions."
        );

        if (!confirmed) return;

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        await chrome.tabs.sendMessage(tab.id, {
            action: "startCourseFeedback"
        });

        window.close();
    });


document
    .getElementById("stopCourseFeedback")
    .addEventListener("click", async () => {

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        await chrome.tabs.sendMessage(tab.id, {
            action: "stopCourseFeedback"
        });

        alert("Course feedback automation stopped.");
    });