
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

async function parseDate(date) {
    const parsedDate = await moment(date, "DD.MM.YYYY");
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

    let iDates = [];
    let fDates = [];

    intensiveSnapshot.forEach(async (doc) => {
        const courseData = doc.data();
        const parsedStartDate = await parseDate(courseData.start.toString());

        iDates.push({
            date: parsedStartDate,
            type: "i",
            places: courseData.places,
            id: doc.id
        });
    }, async () => {
        await sortArray(iDates);
    });

    ferienSnapshot.forEach(async (doc) => {
        const courseData = doc.data();
        const parsedStartDate = await parseDate(courseData.start.toString());

        fDates.push({
            date: parsedStartDate,
            type: "f",
            places: courseData.places,
            id: doc.id
        });
    }, async () => {
        await sortArray(fDates);
    }); 
}

async function sortArray(beforeArray) {
    let array = await beforeArray;
    console.log(array);
    console.log("Arraylänge: " + array.length);
    for (let i = 1; i < array.length; i++) {
      let currentElement = array[i];
      let lastIndex = i - 1;
        
      console.log(compareDates(currentElement.date.valueOf, array[lastIndex].date.valueOf));

      while (lastIndex >= 0 && compareDates(currentElement.date.valueOf, array[lastIndex].date.valueOf) > 0) {
        array[lastIndex + 1] = array[lastIndex];
        lastIndex--;
      }
      array[lastIndex + 1] = currentElement;
    }

    array.forEach((course) => {
        addCourseToList(course.date, course.type, course.places, course.id);
    });
}

function compareDates(a, b) {
  const dateA = moment(a.date, "DD.MM.YYYY");
  const dateB = moment(b.date, "DD.MM.YYYY");

  return dateA.valueOf() - dateB.valueOf(); // Sort by date using Moment's valueOf() method
}

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
