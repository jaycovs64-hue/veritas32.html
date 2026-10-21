/* Socially shared upgrade helpers — gentle profile + sidebar magic */
(function () {
  const PROFILE_KEY = "socially-demo-profile-v3";

  const defaultProfile = {
    displayName: "Your Name",
    username: "yourusername",
    initials: "JD",
    avatarColor: "#292541",
    coverStyle: "default",
    bio: "This is your little corner of the internet."
  };

  const coverPresets = {
    default: "radial-gradient(ellipse at 70% 10%,#8b7cff88,transparent 40%),linear-gradient(120deg,#27213f,#171a2a)",
    aurora: "linear-gradient(135deg,#1a1033 0%,#2d1b4e 40%,#0f2a3a 100%),radial-gradient(ellipse at 20% 80%,#6c5ce788,transparent 50%)",
    softpink: "linear-gradient(135deg,#2a1525 0%,#3d1f35 50%,#1a1220 100%),radial-gradient(ellipse at 80% 20%,#ff9ec888,transparent 45%)",
    ocean: "linear-gradient(135deg,#0c1e2e 0%,#123447 50%,#0a1620 100%),radial-gradient(ellipse at 30% 70%,#4ecdc488,transparent 50%)",
    forest: "linear-gradient(135deg,#0f1f18 0%,#1a2f24 50%,#0c1612 100%),radial-gradient(ellipse at 70% 30%,#6bcb7788,transparent 45%)",
    sunset: "linear-gradient(135deg,#2a1810 0%,#3d2518 40%,#1a1010 100%),radial-gradient(ellipse at 60% 20%,#ff9f4388,transparent 50%)"
  };

  function readProfile() {
    try {
      return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") };
    } catch {
      return { ...defaultProfile };
    }
  }

  function saveProfile(data) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    } catch {}
  }

  function initialsFromName(name) {
    const parts = (name || "YN").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "YN";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  /**
   * Only updates the CURRENT USER's avatars / name / cover.
   * Other people's avatars (chat contacts, etc.) are left alone.
   * Mark your own avatars with data-my-avatar="true" or these IDs.
   */
  function applyProfileEverywhere() {
    const p = readProfile();
    const initials = p.initials || initialsFromName(p.displayName);
    const color = p.avatarColor || "#292541";
    const coverBg = coverPresets[p.coverStyle] || coverPresets.default;

    // 1. Explicit "my avatar" elements
    document.querySelectorAll('[data-my-avatar="true"]').forEach((el) => {
      el.textContent = initials;
      el.style.background = color;
    });

    // 2. Known IDs that always belong to the current user
    const myAvatarIds = [
      "sidebarAvatar",
      "previewAvatar",
      "composerAvatar",
      "settingsHeroAvatar"
    ];
    myAvatarIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = initials;
        el.style.background = color;
      }
    });

    // 3. Top-right profile chip (always the current user)
    document.querySelectorAll(".profile-chip").forEach((el) => {
      el.textContent = initials;
      el.style.background = color;
    });

    // 4. Sidebar / profile-card names & handles
    document.querySelectorAll(".profile-card h2, #sidebarName, #previewName, #settingsDisplayName").forEach((el) => {
      el.textContent = p.displayName || "Your Name";
    });
    document.querySelectorAll(".profile-card p, #sidebarHandle, #previewHandle, #settingsHandle").forEach((el) => {
      if (el.id === "settingsHandle" || el.id === "previewHandle") {
        el.textContent = "@" + (p.username || "yourusername") + (el.id === "settingsHandle" ? " · Personal account" : "");
      } else {
        el.textContent = "@" + (p.username || "yourusername");
      }
    });

    // 5. Bio
    const bioEl = document.getElementById("previewBio");
    if (bioEl) bioEl.textContent = p.bio || "";

    // 6. Cover backgrounds (only the user's own covers)
    document.querySelectorAll(".profile-card .cover, #sidebarCover, #previewCover, [data-my-cover]").forEach((el) => {
      el.style.background = coverBg;
    });
  }

  // Sidebar toggle for mobile + interactivity
  function initSidebar() {
    const layout = document.querySelector(".app-layout");
    const sidebar = document.querySelector(".sidebar");
    if (!layout || !sidebar) return;

    let toggle = document.getElementById("sidebarToggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.id = "sidebarToggle";
      toggle.className = "sidebar-toggle";
      toggle.setAttribute("aria-label", "Toggle menu");
      toggle.innerHTML = "☰";
      const topbar = document.querySelector(".topbar");
      if (topbar) topbar.insertBefore(toggle, topbar.firstChild);
    }

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });

    sidebar.querySelectorAll(".side-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 720) document.body.classList.remove("sidebar-open");
      });
      link.addEventListener("mouseenter", () => link.classList.add("soft-glow"));
      link.addEventListener("mouseleave", () => link.classList.remove("soft-glow"));
    });
  }

  window.SociallyUpgrade = {
    readProfile,
    saveProfile,
    applyProfileEverywhere,
    initialsFromName,
    coverPresets,
    defaultProfile,
    PROFILE_KEY
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyProfileEverywhere();
    initSidebar();
  });
})();
