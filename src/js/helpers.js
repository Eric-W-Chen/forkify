/* Contains helper functions that we will reuse throughout the project */

import { TIMEOUT_SEC } from './config';

//If our fetch takes too long to load the data, we want to time out the request by rejecting the Promise. We are going to implement this by using the race() function to see which settles first: the fetch request or the timeout function
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

//getJSON and sendJSON refactored into one function
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? await fetch(url, {
          method: 'POST',
          headers: {
            //Information about the request
            'Content-Type': 'application/json', //specifying that the data that we're going to send in is going to be in JSON format so the API knows to correctly accept that data and to create a new recipe in the database
          },
          body: JSON.stringify(uploadData), //The data that we want to send. Remember that we specified that the body will be in JSON, so we will use stringify to convert our data that we want to send into JSON
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); //race concurrently initiates the execution of all the promises in the input array. fetch automatically creates a GET request for us to get the data from the passed in URL.
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${data.message} ${res.status}`); //Using the error message from our API and throwing our error so that it gets handled in our catch both. Note that the error object only accepts one string argument
    }

    return data;
  } catch (err) {}
};

// //Function that will fetch data from a web API for us and convert the data to json()
// export const getJSON = async function (url) {
//   try {
//     const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]); //race concurrently initiates the execution of all the promises in the input array. fetch automatically creates a GET request for us to get the data from the passed in URL.
//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(`${data.message} ${res.status}`); //Using the error message from our API and throwing our error so that it gets handled in our catch both. Note that the error object only accepts one string argument
//     }

//     return data;
//   } catch (err) {
//     //Since the purpose of this function is to return a promise, we are also likely going to be using this function inside of another async function. So, we want to rethrow the error so that the async function that called this function could handle the error
//     throw err;
//   }
// };

// //Function that will send data to a web API for us
// export const sendJSON = async function (url, uploadData) {
//   try {
//     const fetchPro = await fetch(url, {
//       method: 'POST',
//       headers: {
//         //Information about the request
//         'Content-Type': 'application/json', //specifying that the data that we're going to send in is going to be in JSON format so the API knows to correctly accept that data and to create a new recipe in the database
//       },
//       body: JSON.stringify(uploadData), //The data that we want to send. Remember that we specified that the body will be in JSON, so we will use stringify to convert our data that we want to send into JSON
//     }); //We can also use fetch to create a POST request in order to send data. In order to do that, aside from just sending in a URL, we also need to send in an options object

//     //We will still do this to time how long this request takes
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); //race concurrently initiates the execution of all the promises in the input array.

//     //Forkify API will actually return back the data that we just sent, so we're still going to await for this
//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(`${data.message} ${res.status}`); //Using the error message from our API and throwing our error so that it gets handled in our catch both. Note that the error object only accepts one string argument
//     }

//     return data;
//   } catch (err) {
//     //Since the purpose of this function is to return a promise, we are also likely going to be using this function inside of another async function. So, we want to rethrow the error so that the async function that called this function could handle the error
//     throw err;
//   }
// };
