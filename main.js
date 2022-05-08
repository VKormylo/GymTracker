const registrationWindow = document.querySelector(".registration");
const loginInput = document.querySelector(".login");
const passwordInput = document.querySelector(".password");
const submitRegistrationBtn = document.querySelector(".submit");
const accountName = document.querySelector(".account-name");

const header = document.querySelector(".header");
const mainContainer = document.querySelector(".container");
const todayBtn = document.querySelector(".get-today");

const bodyContainer = document.querySelector("body");
const settingsContainer = document.querySelector(".settings");
const navLinks = document.querySelectorAll(".link");
const themeOptions = document.querySelectorAll(".theme-option");
const selectElement = document.querySelector(".settings-themes");

const startDeletingAccount = document.querySelector(".account__inner-start");
const deleteForm = document.querySelector(".delete-form");
const deleteFormLogin = document.querySelector(".delete-form__name");
const deleteFormPassword = document.querySelector(".delete-form__password");
const deleteAccount = document.querySelector(".account__inner-delete");
const warningMessage = document.querySelector(".account__inner-warning");
const confirmDeleting = document.querySelector(".account__inner-warning__yes");
const cancelDeleting = document.querySelector(".account__inner-warning__no");
const deletingError = document.querySelector(".account__inner-error");

const workoutsContainer = document.querySelector(".workouts");
const addWorkoutBtn = document.querySelector(".add-workout");

const addExerciseWindow = document.querySelector(".add-exercise");
const addExerciseCancel = document.querySelector(".add-exercise__cancel");
const addExercise = document.querySelector(".add-exercise__add");
const addExerciseInput = document.querySelector(".add-exercise__input");

const addSetWindow = document.querySelector(".add-set");
const addSetKgInput = document.querySelector(".set-input__kg");
const addSetRepsInput = document.querySelector(".set-input__reps");
const addSetTypes = document.querySelectorAll(".set-type");
const addSetCancel = document.querySelector(".add-set__cancel");
const addSet = document.querySelector(".add-set__add");
const deleteSet = document.querySelector(".set-delete");

let accountLogin;
let accountPassword;
let application;

class Workout {
  date = new Date();
  now = this.date.getDate();

  constructor(id, exercises, day) {
    this.id = id;
    this.exercises = exercises;
    this.day = day;
  }

  _setDate() {
    if (this.day === this.now - 0) return (this.day = "Today");
    if (this.day === this.now - 1) return (this.day = "Yesterday");
    if (this.day === this.now - 2) return (this.day = "Two days ago");
    if (this.day === this.now - 3) return (this.day = "Three days ago");
    return this.day;
  }
}

class Exercise {
  constructor(name, id, sets) {
    this.name = name;
    this.id = id;
    this.sets = sets;
  }
}

class Set {
  constructor(kg, reps, type, id) {
    this.kg = kg;
    this.reps = reps;
    this.type = type.dataset.type;
    this.id = id;
  }
}

class App {
  #workouts = [];
  login;
  password;
  types = Array.from(addSetTypes);
  activeType;
  addSetWindowBtn;
  addExerciseBtn;
  updateSetBtn = addSet.cloneNode(true);
  exerciseContainer;
  setContainer;
  workoutID = 0;
  exerciseID = 0;
  setID = 0;
  currentWorkout;
  currentExercise;
  currentItem;
  currentSet;
  setElement;
  currentPage;
  currentTheme = "green";

  constructor(login, password) {
    this.login = login;
    this.password = password;
    if (this.login && this.password) {
      addWorkoutBtn.addEventListener("click", this._newWorkout.bind(this));
      this._getLocalStorage();
      this._showWorkouts();
      addWorkoutBtn.addEventListener(
        "click",
        this._showNextWorkout.bind(this, undefined, true)
      );
      todayBtn.addEventListener("click", this._showWorkouts.bind(this));
      this._setToday();
      navLinks.forEach((link) =>
        link.addEventListener("click", this._navigation.bind(this, link))
      );
      this._setPage();
      this._setTheme();
      selectElement.addEventListener("change", this._changeTheme.bind(this));
      startDeletingAccount.addEventListener(
        "click",
        this._startDeletingAccount.bind(this)
      );
    }
  }
  // ------------ HELPER FUNCTIONS ------------

  _hideWindows([...elements], [...inputs], text = false) {
    debugger;
    elements.forEach((element) => (element.style.display = "none"));
    text
      ? inputs.forEach((element) => (element.textContent = ""))
      : inputs.forEach((input) => (input.value = ""));
  }

  _navigation(link) {
    if (!link.classList.contains("active")) {
      navLinks.forEach((link) => link.classList.remove("active"));
      link.classList.add("active");
    }
    this._setPage();
  }

  _setPage() {
    this.currentPage = Array.from(navLinks)
      .find((link) => link.classList.contains("active"))
      .firstElementChild.textContent.toLowerCase();
    if (this.currentPage === "workouts") {
      mainContainer.style.display = "block";
      settingsContainer.style.display = "none";
    } else if (this.currentPage === "settings") {
      settingsContainer.style.display = "block";
      mainContainer.style.display = "none";
    }
  }

  _setTheme() {
    themeOptions.forEach((option) =>
      option.value === this.currentTheme ? (option.selected = true) : ""
    );
    themeOptions.forEach((theme) =>
      theme.selected === true ? (bodyContainer.className = theme.value) : ""
    );
  }

  _changeTheme(e) {
    if (e.target.value !== this.currentTheme) {
      console.log(e.target.value);
      this.currentTheme = e.target.value;
      this._setTheme();
      this._setLocalStorage();
    }
  }

  _startDeletingAccount() {
    console.log(startDeletingAccount.textContent);
    if (startDeletingAccount.classList.contains("process")) {
      deleteForm.style.display = "none";
      startDeletingAccount.textContent = "Start";
      startDeletingAccount.classList.remove("process");
      this._hideWindows(
        [deleteForm, deletingError],
        [deleteFormLogin, deleteFormPassword, deletingError]
      );
    } else {
      startDeletingAccount.textContent = "Cancel";
      startDeletingAccount.classList.add("process");
      deleteForm.style.display = "grid";
      deleteAccount.addEventListener("click", this._deleteAccount.bind(this));
    }
  }

  _deleteAccount() {
    if (
      deleteFormLogin.value === this.login &&
      deleteFormPassword.value === this.password
    ) {
      this._hideWindows([deleteAccount, deletingError], [deletingError], true);
      warningMessage.style.display = "block";
      confirmDeleting.addEventListener("click", function () {
        localStorage.clear();
        document.location.reload();
        initialize();
      });
      cancelDeleting.addEventListener("click", function () {
        warningMessage.style.display = "none";
        deleteAccount.style.display = "block";
      });
    } else {
      deletingError.textContent = "Login or email isn't valid, try again";
      deletingError.style.display = "block";
    }
  }

  // ------------ SETTING DATE ------------

  _setToday() {
    this.currentItem >= this.#workouts.indexOf(this.#workouts.slice(-1)[0]) - 1
      ? todayBtn.classList.add("active")
      : todayBtn.classList.remove("active");
  }

  _setWorkoutDate(now, workoutDay) {
    let day = Number(workoutDay.slice(workoutDay.indexOf(".") + 1));
    if (now === day) return "Today";
    if (now === day + 1) return "Yesterday";
    if (now === day + 2) return "Two days ago";
    if (now === day + 3) return "Three days ago";
    return workoutDay;
  }

  // ------------ CREATING AND RENDERING WORKOUT ------------

  _newWorkout(e) {
    e.preventDefault();
    ++this.workoutID;
    const day = new Date().getDate();
    const workout = new Workout(this.workoutID, [], day);
    this.#workouts.push(workout);
    this.workoutBtn = e.target;
    this._renderWorkout(workout, true);
    this._setLocalStorage();
  }

  _renderWorkout(workout, create = false) {
    const now = new Date().getDate();
    let workoutDay;
    if (create) {
      const month = String(workout.date.getMonth() + 1);
      const day = String(workout.date.getDate());
      workoutDay = Array(month, day).join(".");
    } else {
      workoutDay = workout.date.toString().slice(5, 10).split("-").join(".");
    }
    let html = `
    <div class="workout" data-id="${workout.id}">
      <a class="workout-delete">Delete</a>
      <div class="workout-day ${now === workout.now ? "now" : ""}" data-id="${
      workout.id
    }">${this._setWorkoutDate(now, workoutDay)}</div>
      <a href="#" class="add-exercise-btn">Add new exercise</a>
    </div>
    `;
    addWorkoutBtn.insertAdjacentHTML("beforebegin", html);
    const that = this;
    const workoutElement = addWorkoutBtn.previousElementSibling;
    const deleteWorkout = workoutElement.querySelector(".workout-delete");
    workoutElement.addEventListener("mouseover", function () {
      deleteWorkout.style.display = "block";
    });
    workoutElement.addEventListener("mouseout", function () {
      deleteWorkout.style.display = "none";
    });
    deleteWorkout.addEventListener("click", function () {
      const workoutIndex = that.#workouts.indexOf(workout);
      that.#workouts.splice(workoutIndex, 1);
      that.#workouts
        .slice(workoutIndex)
        .forEach((workout) => (workout.id = workout.id - 1));
      workoutElement.remove();
      that._setLocalStorage();
      // document.querySelectorAll(`.workout`).forEach((workout) => {
      //   if (Number(workout.dataset.id) > workoutIndex) {
      //     workout.dataset.id = workout.dataset.id - 1;
      //   }
      // });
      document.location.reload();
    });
    this.currentItem = this.#workouts.indexOf(this.#workouts.slice(-1)[0]);
    this.addExerciseBtn = addWorkoutBtn.previousElementSibling.lastElementChild;
    this.addExerciseBtn.dataset.id = workout.id;
    const workoutDayBtn = document
      .querySelector(`.workout[data-id*="${workout.id}"]`)
      .querySelector(".workout-day");
    workoutDayBtn.addEventListener(
      "click",
      this._showNextWorkout.bind(this, Number(workoutDayBtn.dataset.id), false)
    );
    workoutDayBtn.addEventListener(
      "click",
      this._showPrevWorkout.bind(this, Number(workoutDayBtn.dataset.id), false)
    );
    this.addExerciseBtn.addEventListener("click", this._newExercise.bind(this));
  }

  // ------------ CREATING AND RENDERING EXERCISE ------------

  _newExercise(e) {
    e.preventDefault();
    this.exerciseContainer = e.target;
    this.currentWorkout = this.#workouts.findIndex(
      (work) => work.id == e.target.dataset.id
    );
    this.#workouts[this.currentWorkout].exercises.length === 0
      ? (this.exerciseID = 1)
      : (this.exerciseID =
          this.#workouts[this.currentWorkout].exercises.length + 1);
    const that = this;
    // Getting coords to position addExerciseWindow
    const { x: left, y: top } = e.target.getBoundingClientRect();
    addExerciseWindow.style.display = "block";
    addExerciseWindow.style.left = `${left - 32}px`;
    addExerciseWindow.style.top = `${top - 15}px`;
    addExerciseCancel.addEventListener(
      "click",
      this._hideWindows.bind(
        this,
        [addExerciseWindow],
        [addExerciseInput],
        false
      )
    );
    // Adding new exercise
    addExercise.addEventListener("click", function () {
      if (addExerciseInput.value) {
        const name = addExerciseInput.value;
        const exercise = new Exercise(name, that.exerciseID, []);
        // Get data
        that.#workouts[that.currentWorkout].exercises.push(exercise);
        that._renderExercise(exercise);
        that._setLocalStorage();
        that._hideWindows([addExerciseWindow], [addExerciseInput]);
        return;
      } else if (addExerciseInput.value === "") {
        addExerciseInput.classList.add("error");
        addExerciseInput.addEventListener("keypress", function () {
          addExerciseInput.classList.remove("error");
        });
      }
    });
  }

  _renderExercise(exercise) {
    let html = `
    <div class="exercise" data-id="${exercise.id}">
      <div class="exercise-type">
        <div class="exercise-img"></div>
        <div class="exercise-name">${exercise.name}</div>
      </div>
      <div class="exercise-sets">   
      <a class="exercise-delete">
      <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px"><path d="M18,21H6c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h12c1.657,0,3,1.343,3,3v12	C21,19.657,19.657,21,18,21z" opacity=".35"/><path d="M14.812,16.215L7.785,9.188c-0.384-0.384-0.384-1.008,0-1.392l0.011-0.011c0.384-0.384,1.008-0.384,1.392,0l7.027,7.027	c0.384,0.384,0.384,1.008,0,1.392l-0.011,0.011C15.82,16.599,15.196,16.599,14.812,16.215z"/><path d="M7.785,14.812l7.027-7.027c0.384-0.384,1.008-0.384,1.392,0l0.011,0.011c0.384,0.384,0.384,1.008,0,1.392l-7.027,7.027	c-0.384,0.384-1.008,0.384-1.392,0l-0.011-0.011C7.401,15.82,7.401,15.196,7.785,14.812z"/></svg>
      </a>
        <div class="set-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.6788 0.0102901C10.3402 0.0429478 9.98771 0.140915 9.72377 0.276697C9.13688 0.579197 8.69583 1.17045 8.52393 1.88888C8.43017 2.27732 8.43364 2.15873 8.42669 5.42607L8.41975 8.45623H5.44705C2.22779 8.45623 2.25384 8.45623 1.851 8.54904C1.15124 8.71404 0.567809 9.14373 0.277833 9.71092C0.0798846 10.1011 -0.017353 10.5944 0.00521998 11.1151C0.0347385 11.7992 0.276096 12.3595 0.736239 12.815C1.08352 13.157 1.45684 13.3633 1.94303 13.4767C2.29725 13.5609 2.26079 13.5609 5.43837 13.5609H8.41975L8.42669 16.5894C8.43364 19.8584 8.43017 19.7398 8.52393 20.1283C8.69757 20.8519 9.12298 21.419 9.71856 21.7215C9.93388 21.8315 10.1509 21.902 10.4166 21.9519C10.7083 22.0069 11.2744 22.0069 11.5678 21.9519C12.0887 21.8556 12.4603 21.6648 12.8059 21.3228C13.2122 20.9172 13.4396 20.4445 13.5369 19.8C13.5647 19.6195 13.5681 19.3359 13.5733 16.5808L13.5803 13.5609H16.5617C19.84 13.5609 19.7722 13.5626 20.1924 13.4561C20.887 13.279 21.434 12.8545 21.7309 12.2564C21.9931 11.7322 22.0712 10.9828 21.9306 10.3211C21.7865 9.63013 21.361 9.08357 20.7203 8.76217C20.5119 8.6556 20.3904 8.61263 20.1438 8.55076C19.7653 8.45623 19.7775 8.45623 16.553 8.45623H13.5803L13.5733 5.42607C13.5681 2.73795 13.5647 2.37701 13.5386 2.21373C13.4362 1.5417 13.1861 1.04842 12.7347 0.618729C12.4152 0.31451 12.0523 0.137478 11.573 0.0498219C11.3855 0.0154476 10.8681 -0.00689697 10.6788 0.0102901Z"
              fill="#696969"
            />
          </svg>
        </div>
      </div>
      </div>
    `;
    const that = this;
    this.exerciseContainer.insertAdjacentHTML("beforebegin", html);
    const exerciseElement = this.exerciseContainer.previousElementSibling;
    const deleteExerise = exerciseElement.querySelector(".exercise-delete");
    exerciseElement.addEventListener("mouseover", function () {
      deleteExerise.style.display = "block";
      deleteExerise.style.opacity = "1";
    });
    exerciseElement.addEventListener("mouseout", function () {
      deleteExerise.style.display = "none";
      deleteExerise.style.opacity = "0";
    });
    deleteExerise.addEventListener("click", function () {
      const workoutIndex = that.#workouts.findIndex((workout) =>
        workout.exercises.includes(exercise)
      );
      const exerciseIndex =
        that.#workouts[workoutIndex].exercises.indexOf(exercise);
      console.log(exerciseIndex);
      that.#workouts[workoutIndex].exercises.splice(exerciseIndex, 1);
      that.#workouts[workoutIndex].exercises
        .slice(exerciseIndex)
        .forEach((exercise) => (exercise.id = exercise.id - 1));
      exerciseElement.remove();
      that._setLocalStorage();
      document
        .querySelector(`.workout[data-id*="${workoutIndex + 1}"]`)
        .querySelectorAll(".exercise")
        .forEach((exercise) => {
          if (Number(exercise.dataset.id) > exerciseIndex) {
            exercise.dataset.id = exercise.dataset.id - 1;
          }
        });
    });
    this.addSetWindowBtn =
      this.exerciseContainer.previousElementSibling.lastElementChild.lastElementChild;
    this.addSetWindowBtn.dataset.id =
      this.addSetWindowBtn.parentElement.parentElement.dataset.id;
    this.addSetWindowBtn.addEventListener("click", this._newSet.bind(this));
  }

  // ------------ CREATING RENDERING AND UPDATING SET ------------

  _setType() {
    const that = this;
    this.activeType = this.types.find((type) =>
      type.classList.contains("active")
    );
    this.types.forEach((type) =>
      type.addEventListener("click", function (e) {
        e.target.classList.add(e.target.dataset.type, "active");
        that.types.forEach((type) => {
          if (type === e.target) return;
          type.classList.value = "";
          type.classList.add("set-type");
        });
        that.activeType = that.types.find((type) =>
          type.classList.contains("active")
        );
      })
    );
  }

  _changeSet(update) {
    if (addSetKgInput.value && addSetRepsInput.value) {
      if (!update) {
        const kg = addSetKgInput.value;
        const reps = addSetRepsInput.value;
        const set = new Set(kg, reps, this.activeType, this.setID);
        this.#workouts[this.currentWorkout].exercises[
          this.currentExercise
        ].sets.push(set);
        this._renderSet(set, this.setContainer);
      } else if (update) {
        this.currentSet.kg = addSetKgInput.value;
        this.currentSet.reps = addSetRepsInput.value;
        this.currentSet.type = this.activeType.dataset.type;
        console.log(this.activeType.dataset.type);
        this.setElement.classList.remove(this.setElement.classList.item(1));
        this.setElement.classList.add(`${this.activeType.dataset.type}`);
        this.setElement.dataset.id = this.currentSet.id;
        this.setElement.innerHTML = `
          <div class="exercise-kg">${this.currentSet.kg} <span>kg</span></div>
          <div class="exercise-reps">${this.currentSet.reps} <span>reps</span></div>
    `;
      }
      this._setLocalStorage();
      this._hideWindows(
        [addSetWindow, deleteSet],
        [addSetKgInput, addSetRepsInput]
      );
    } else if (!addSetKgInput.value && !addSetRepsInput.value) {
      addExerciseInput.classList.add("error");
      addExerciseInput.addEventListener("keypress", function () {
        addExerciseInput.classList.remove("error");
      });
    }
  }

  _newSet(e) {
    e.preventDefault();
    const btn =
      e.currentTarget.parentElement.parentElement.parentElement
        .lastElementChild;
    this.currentWorkout = this.#workouts.findIndex(
      (work) => work.id == btn.dataset.id
    );
    this.currentExercise = this.#workouts[
      this.currentWorkout
    ].exercises.findIndex(
      (exercise) => exercise.id == e.currentTarget.dataset.id
    );
    this.#workouts[this.currentWorkout].exercises[this.currentExercise].sets
      .length === 0
      ? (this.setID = 1)
      : (this.setID =
          this.#workouts[this.currentWorkout].exercises[this.currentExercise]
            .sets.length + 1);
    const exerciseCoords = e.currentTarget.parentElement.parentElement;
    const { x: left, y: top } = exerciseCoords.getBoundingClientRect();
    addSetWindow.style.display = "block";
    addSetWindow.style.left = `${left + 18}px`;
    addSetWindow.style.top = `${top - 38}px`;
    this._setType();
    addSetCancel.addEventListener(
      "click",
      this._hideWindows.bind(
        this,
        [addSetWindow],
        [addSetKgInput, addSetRepsInput],
        false
      )
    );
    this.updateSetBtn?.replaceWith(addSet);
    addSet.addEventListener("click", this._changeSet.bind(this, false));
  }

  _renderSet(set) {
    const html = `
        <div class="exercise-set ${set.type}" data-id="${set.id}">
          <div class="exercise-kg">${set.kg} <span>kg</span></div>
          <div class="exercise-reps">${set.reps} <span>reps</span></div>
        </div>
    `;
    this.addSetWindowBtn =
      this.exerciseContainer.previousElementSibling.lastElementChild.lastElementChild;
    this.setContainer = this.addSetWindowBtn;
    this.setContainer = document
      .querySelector(`.workout[data-id*="${this.currentWorkout + 1}"]`)
      .querySelector(`.set-btn[data-id*='${this.currentExercise + 1}']`);
    this.setContainer.insertAdjacentHTML("beforebegin", html);
    const setItem = document
      .querySelector(`.workout[data-id*="${this.currentWorkout + 1}"]`)
      .querySelector(`.exercise[data-id*="${this.currentExercise + 1}"]`)
      .querySelector(".exercise-sets")
      .querySelector(`.exercise-set[data-id*='${set.id}']`);
    setItem.addEventListener("click", this._updateSet.bind(this));
    console.log(setItem);
  }

  _updateSet(e) {
    console.log(e.currentTarget);
    this.setElement = e.currentTarget;
    this.currentExercise =
      this.setElement.parentElement.parentElement.dataset.id - 1;
    this.currentWorkout =
      this.setElement.parentElement.parentElement.parentElement.dataset.id - 1;
    console.log(this.currentExercise);
    const that = this;
    const exerciseCoords = this.setElement.parentElement.parentElement;
    const { x: left, y: top } = exerciseCoords.getBoundingClientRect();
    addSetWindow.style.display = "block";
    addSetWindow.style.left = `${left + 22}px`;
    addSetWindow.style.top = `${top - 50}px`;
    this.types.forEach((type) => {
      if (type.dataset.type === this.setElement.classList[1]) {
        type.classList.add(`${this.setElement.classList[1]}`, "active");
      } else {
        type.className = "set-type";
      }
    });
    this._setType();
    const kgElement = this.setElement.querySelector(".exercise-kg").textContent;
    const repsElement =
      this.setElement.querySelector(".exercise-reps").textContent;
    addSetKgInput.value = kgElement.slice(0, kgElement.indexOf(" "));
    addSetRepsInput.value = repsElement.slice(0, kgElement.indexOf(" "));
    this.currentSet =
      this.#workouts[this.currentWorkout].exercises[this.currentExercise].sets[
        this.setElement.dataset.id - 1
      ];
    console.log(this.currentSet);
    deleteSet.style.display = "block";
    deleteSet.addEventListener("click", function () {
      const setIndex = that.#workouts[that.currentWorkout].exercises[
        that.currentExercise
      ].sets.indexOf(that.currentSet);
      console.log(setIndex);
      that.#workouts[that.currentWorkout].exercises[
        that.currentExercise
      ].sets.splice(setIndex, 1);
      that.#workouts[that.currentWorkout].exercises[that.currentExercise].sets
        .slice(setIndex)
        .forEach((set) => (set.id = set.id - 1));
      that.setElement.remove();
      that._setLocalStorage();
      that._hideWindows(
        [addSetWindow, deleteSet],
        [addSetKgInput, addSetRepsInput]
      );
      document
        .querySelector(`.workout[data-id*="${that.currentWorkout + 1}"]`)
        .querySelector(`.exercise[data-id*="${that.currentExercise + 1}"]`)
        .querySelector(".exercise-sets")
        .querySelectorAll(".exercise-set")
        .forEach((set) => {
          if (Number(set.dataset.id) > setIndex) {
            set.dataset.id = set.dataset.id - 1;
          }
        });
    });
    addSetCancel.addEventListener(
      "click",
      this._hideWindows.bind(
        this,
        [addSetWindow, deleteSet],
        [addSetKgInput, addSetRepsInput],
        false
      )
    );
    addSet.replaceWith(this.updateSetBtn);
    this.updateSetBtn.addEventListener(
      "click",
      this._changeSet.bind(this, true)
    );
  }

  // ------------ LOCAL STORAGE ------------

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
    localStorage.setItem("theme", JSON.stringify(this.currentTheme));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    const theme = JSON.parse(localStorage.getItem("theme"));

    if (!data || !theme) return;

    this.currentTheme = theme;
    this.#workouts = data;
    this.#workouts.forEach((workout) => {
      this._renderWorkout(workout);
      this.workoutID = this.#workouts.length;
      workout.exercises.forEach((exercise) => {
        this.exerciseContainer = document.querySelector(
          `.add-exercise-btn[data-id*='${workout.id}']`
        );
        this.currentWorkout = this.#workouts.findIndex(
          (work) => work.id == this.exerciseContainer.dataset.id
        );
        this.exerciseID = this.#workouts[this.currentWorkout].exercises.length;
        this._renderExercise(exercise);
        exercise.sets.forEach((set) => {
          this.setContainer = document.querySelector(
            `.set-btn[data-id*='${exercise.id}']`
          );
          this.currentExercise = this.#workouts[
            this.currentWorkout
          ].exercises.findIndex(
            (exercise) => exercise.id == this.setContainer.dataset.id
          );
          this.setID =
            this.#workouts[this.currentWorkout].exercises[
              this.currentExercise
            ].sets.length;
          console.log(this.setID);
          this._renderSet(set);
        });
      });
    });
  }

  // ------------ SHOW LAST WORKOUTS AND SLIDING WORKOUTS ------------

  _showWorkouts() {
    const slides = document.querySelectorAll(".workout");
    const arr = Array.from(slides).reverse();
    let counter = 1;
    arr.slice(0, 3).forEach((workout) => {
      workout.style.transform = "translateX(0)";
      workout.style.opacity = "100";
      workout.style.display = "flex";
    });
    arr.slice(3).forEach((workout) => {
      workout.style.transform = `translateX(${-100 * counter}%)`;
      workout.style.opacity = "0";
      workout.style.display = "none";
      counter++;
    });
    console.log(arr);
    this.currentItem = this.#workouts.indexOf(this.#workouts.slice(-1)[0]);
    this._setToday();
    addWorkoutBtn.style.display = "block";
  }

  _showNextWorkout(item, add = false) {
    if (this.currentItem < item || this.currentItem < this.#workouts.length) {
      add ? (item = Number(this.#workouts.length) - 1) : "";
      if (item > this.currentItem - 1) {
        const lastWorkout = document.querySelector(
          `.workout[data-id*="${item - 2}"`
        );
        const nextWorkout = document.querySelector(
          `.workout[data-id*="${item + 1}"`
        );
        lastWorkout.style.transform = "translateX(-100%)";
        lastWorkout.style.opacity = "0";
        setTimeout(() => {
          lastWorkout.style.display = "none";
        }, 300);
        if (nextWorkout) {
          nextWorkout.style.display = "flex";
          setTimeout(() => {
            nextWorkout.style.transform = "translateX(0)";
            nextWorkout.style.opacity = "100";
          }, 300);
        }
        this._setToday();
        ++this.currentItem;
        if (
          this.currentItem ===
          this.#workouts.indexOf(this.#workouts.slice(-1)[0])
        ) {
          addWorkoutBtn.style.display = "block";
        }
      }
    }
  }

  _showPrevWorkout(item) {
    if (
      this.currentItem >
      this.#workouts.indexOf(this.#workouts.slice(0)[0]) + 1
    ) {
      if (item <= this.currentItem) {
        const lastWorkout = document.querySelector(
          `.workout[data-id*="${item - 1}"`
        );
        const nextWorkout = document.querySelector(
          `.workout[data-id*="${item + 2}"`
        );
        lastWorkout.style.display = "flex";
        setTimeout(() => {
          lastWorkout.style.transform = "translateX(0)";
          lastWorkout.style.opacity = "100";
        }, 300);
        nextWorkout.style.transform = "translateX(100%)";
        nextWorkout.style.opacity = "0";
        setTimeout(() => {
          nextWorkout.style.display = "none";
        }, 300);
        todayBtn.classList.remove("active");
        addWorkoutBtn.style.display = "none";
        --this.currentItem;
      }
    }
  }
}

function initialize() {
  if (!localStorage.getItem("authentication")) {
    registrationWindow.style.display = "flex";
    return;
  }
  const auth = JSON.parse(localStorage.getItem("authentication"));
  accountLogin = auth[0];
  accountPassword = auth[1];
  if (accountLogin && accountPassword) {
    header.style.display = "block";
    mainContainer.style.display = "block";
    accountName.textContent =
      accountLogin.slice(0, 1).toUpperCase() +
      accountLogin.slice(1).toLowerCase();
  }
  application = new App(accountLogin, accountPassword);
}
initialize();

function authentication() {
  const auth = [loginInput.value, passwordInput.value];
  localStorage.setItem("authentication", JSON.stringify(auth));
  registrationWindow.style.display = "none";
  initialize();
}

submitRegistrationBtn.addEventListener("click", authentication);
