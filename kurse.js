
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, query, where, collection, doc, setDoc, addDoc, getDoc, getDocs, getCountFromServer, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA0SBKZ8NbGpGzD0rqD7A4OG6TJVeqYxJ0",
    authDomain: "fahrschule-sieber.firebaseapp.com",
    projectId: "fahrschule-sieber",
    storageBucket: "fahrschule-sieber.appspot.com",
    messagingSenderId: "102112916651",
    appId: "1:102112916651:web:1a633f589c6d62ae1c33ee",
    measurementId: "G-07JZZQK05B"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

async function getMemberCount(id) {
    const docRef = doc(db, "courses", id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.data().members.length;
}

function parseDate(date) {
    const parsedDate = moment(date, "DD.MM.YYYY");
    return parsedDate.format("DD.MM.YYYY");
}

async function loadCourses() {
    const intensiveQuery = query(
        collection(db, "courses"),
        where("archived", "==", false),
        where("type", "==", "i"),
        orderBy("start")
    );
    const ferienQuery = query(
        collection(db, "courses"),
        where("archived", "==", false),
        where("type", "==", "f"),
        orderBy("start")
    );

    const [intensiveSnapshot, ferienSnapshot] = await Promise.all([
        getDocs(intensiveQuery),
        getDocs(ferienQuery)
    ]);

    const iDates = [];
    const fDates = [];

    intensiveSnapshot.forEach(async (doc) => {
        const courseData = doc.data();
        const parsedStartDate = parseDate(courseData.start.toString());

        const insertIndex = iDates.findInsertIndex((c) => c.date >= parsedStartDate);
        iDates.splice(insertIndex, 0, {
            date: parsedStartDate,
            type: "i",
            places: courseData.places,
            id: doc.id
        });
    });

    ferienSnapshot.forEach(async (doc) => {
        const courseData = doc.data();
        const parsedStartDate = parseDate(courseData.start.toString());

        const insertIndex = fDates.findInsertIndex((c) => c.date >= parsedStartDate);
        fDates.splice(insertIndex, 0, {
            date: parsedStartDate,
            type: "f",
            places: courseData.places,
            id: doc.id
        });
    });

    iDates.forEach((course) => {
        addCourseToList(course.date, course.type, course.places, course.id);
    });

    fDates.forEach((course) => {
        addCourseToList(course.date, course.type, course.places, course.id);
    });

    return;
}

Array.prototype.findInsertIndex = function (compareFn) {
    let low = 0;
    let high = this.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const comparison = compareFn(this[mid]);

        if (comparison === 0) {
            return mid; // Element already exists, insert at equal index
        } else if (comparison < 0) {
            high = mid; // Insert before or equal to mid
        } else {
            low = mid + 1; // Insert after mid
        }
    }

    return low; // Insert at low (new smallest element)
};

let idiv = document.getElementById("idiv");
idiv.innerHTML = "";
let fdiv = document.getElementById("fdiv");
fdiv.innerHTML = "";

async function addCourseToList(start, type, places, id) {
    let members = await getMemberCount(id);
    if (type == "i") {
        if (places - members >= 4) {
            idiv.innerHTML = (idiv.innerHTML + "<div class='course-item background-color-grey padding-large'><div class='w-layout-grid course-item-grid'><div id='w-node-ec1a1927-dfea-f049-7e0d-ed4362d68913-65ce5f09' class='course-item-header'><div class='text-size-small text-weight-medium text-color-darkgrey'>Theorie · " + start + "</div><h4 class='text-weight-semibold text-color-black'>Intensivkurs</h4><div class='text-size-small text-weight-normal text-color-grey'>Mit der Buchung, bist du nur für den gewünschten Kurs vorgemerkt<span class='text-span'>*</span>.</div></div><div id='w-node-baf87b1f-1b81-6aa0-9617-4c39e0b93465-65ce5f09' class='course-item-grid-div'><a href='/buchen?id=" + id + "' id='" + id + "' class='button w-button'>Jetzt buchen</a><div class='course-item-status'><img src='https://assets-global.website-files.com/64f31cc72d17cfe82ab9d24b/64f374e9fe7845460509a8f9_check-green.svg' loading='lazy' alt=''><div class='text-size-small text-weight-bold text-color-black'>Plätze frei</div></div></div></div></div>");
        } else if (places - members == 0) {
            idiv.innerHTML = (idiv.innerHTML + "<div class='course-item background-color-grey padding-large'><div class='w-layout-grid course-item-grid'><div id='w-node-ec1a1927-dfea-f049-7e0d-ed4362d68913-65ce5f09' class='course-item-header'><div class='text-size-small text-weight-medium text-color-darkgrey'>Theorie · " + start + "</div><h4 class='text-weight-semibold text-color-black'>Intensivkurs</h4><div class='text-size-small text-weight-normal text-color-grey'>Mit der Buchung, bist du nur für den gewünschten Kurs vorgemerkt<span class='text-span'>*</span>.</div></div><div id='w-node-baf87b1f-1b81-6aa0-9617-4c39e0b93465-65ce5f09' class='course-item-grid-div'><a style='pointer-events: none' id='" + id + "' class='button w-button'>Jetzt buchen</a><div class='course-item-status'><img src='https://assets-global.website-files.com/64f31cc72d17cfe82ab9d24b/64f37501e775c7ac82e8393b_check-red.svg' loading='lazy' alt=''><div class='text-size-small text-weight-bold text-color-black'>Ausgebucht</div></div></div></div></div>");
        } else {
            let num = parseInt(places) - parseInt(members);
            idiv.innerHTML = (idiv.innerHTML + "<div class='course-item background-color-grey padding-large'><div class='w-layout-grid course-item-grid'><div id='w-node-ec1a1927-dfea-f049-7e0d-ed4362d68913-65ce5f09' class='course-item-header'><div class='text-size-small text-weight-medium text-color-darkgrey'>Theorie · " + start + "</div><h4 class='text-weight-semibold text-color-black'>Intensivkurs</h4><div class='text-size-small text-weight-normal text-color-grey'>Mit der Buchung, bist du nur für den gewünschten Kurs vorgemerkt<span class='text-span'>*</span>.</div></div><div id='w-node-baf87b1f-1b81-6aa0-9617-4c39e0b93465-65ce5f09' class='course-item-grid-div'><a href='/buchen?id=" + id + "' id='" + id + "' class='button w-button'>Jetzt buchen</a><div class='course-item-status'><img src='https://assets-global.website-files.com/64f31cc72d17cfe82ab9d24b/64f3754a9ac3b846f89eec3a_check-yellow.svg' loading='lazy' alt=''><div class='text-size-small text-weight-bold text-color-black'>Nur noch " + num + " Plätze</div></div></div></div></div>");
        }
    } else if (type == "f") {
        if (places - members >= 4) {
            fdiv.innerHTML = (fdiv.innerHTML + "<div class='course-item background-color-grey padding-large'><div class='w-layout-grid course-item-grid'><div id='w-node-ec1a1927-dfea-f049-7e0d-ed4362d68913-65ce5f09' class='course-item-header'><div class='text-size-small text-weight-medium text-color-darkgrey'>Theorie & Praxis · " + start + "</div><h4 class='text-weight-semibold text-color-black'>Ferienkurs</h4><div class='text-size-small text-weight-normal text-color-grey'>Mit der Buchung, bist du nur für den gewünschten Kurs vorgemerkt<span class='text-span'>*</span>.</div></div><div id='w-node-baf87b1f-1b81-6aa0-9617-4c39e0b93465-65ce5f09' class='course-item-grid-div'><a href='/buchen?id=" + id + "' id='" + id + "' class='button w-button'>Jetzt buchen</a><div class='course-item-status'><img src='https://assets-global.website-files.com/64f31cc72d17cfe82ab9d24b/64f374e9fe7845460509a8f9_check-green.svg' loading='lazy' alt=''><div class='text-size-small text-weight-bold text-color-black'>Plätze frei</div></div></div></div></div>");
        } else if (places - members == 0) {
            fdiv.innerHTML = (fdiv.innerHTML + "<div class='course-item background-color-grey padding-large'><div class='w-layout-grid course-item-grid'><div id='w-node-ec1a1927-dfea-f049-7e0d-ed4362d68913-65ce5f09' class='course-item-header'><div class='text-size-small text-weight-medium text-color-darkgrey'>Theorie & Praxis · " + start + "</div><h4 class='text-weight-semibold text-color-black'>Ferienkurs</h4><div class='text-size-small text-weight-normal text-color-grey'>Mit der Buchung, bist du nur für den gewünschten Kurs vorgemerkt<span class='text-span'>*</span>.</div></div><div id='w-node-baf87b1f-1b81-6aa0-9617-4c39e0b93465-65ce5f09' class='course-item-grid-div'><a style='pointer-events: none' id='" + id + "' class='button w-button'>Jetzt buchen</a><div class='course-item-status'><img src='https://assets-global.website-files.com/64f31cc72d17cfe82ab9d24b/64f37501e775c7ac82e8393b_check-red.svg' loading='lazy' alt=''><div class='text-size-small text-weight-bold text-color-black'>Ausgebucht</div></div></div></div></div>");
        } else {
            let num = parseInt(places) - parseInt(members);
            fdiv.innerHTML = (fdiv.innerHTML + "<div class='course-item background-color-grey padding-large'><div class='w-layout-grid course-item-grid'><div id='w-node-ec1a1927-dfea-f049-7e0d-ed4362d68913-65ce5f09' class='course-item-header'><div class='text-size-small text-weight-medium text-color-darkgrey'>Theorie & Praxis · " + start + "</div><h4 class='text-weight-semibold text-color-black'>Ferienkurs</h4><div class='text-size-small text-weight-normal text-color-grey'>Mit der Buchung, bist du nur für den gewünschten Kurs vorgemerkt<span class='text-span'>*</span>.</div></div><div id='w-node-baf87b1f-1b81-6aa0-9617-4c39e0b93465-65ce5f09' class='course-item-grid-div'><a href='/buchen?id=" + id + "' id='" + id + "' class='button w-button'>Jetzt buchen</a><div class='course-item-status'><img src='https://assets-global.website-files.com/64f31cc72d17cfe82ab9d24b/64f3754a9ac3b846f89eec3a_check-yellow.svg' loading='lazy' alt=''><div class='text-size-small text-weight-bold text-color-black'>Nur noch " + num + " Plätze</div></div></div></div></div>");
        }
    }
}

document.addEventListener("DOMContentLoaded", loadCourses());
