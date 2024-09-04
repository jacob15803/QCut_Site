
    var  firebaseConfig = {
        apiKey: "AIzaSyC3S50eHZY76Gr7mpA0gCs_I5JWYBmYs0Y",
        authDomain: "qcut-60cec.firebaseapp.com",
        projectId: "qcut-60cec",
        storageBucket: "qcut-60cec.appspot.com",
        messagingSenderId: "42169019245",
        appId: "1:42169019245:web:fc7aa73d8b381dded00864"
      };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();


    function getname(sid) {
        return new Promise((resolve, reject) => {
            db.collection("usernames").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const sa = data.sid.toString();
                    const name = data.name.toString();
                    console.log(sid);
                    console.log(sa);
                    if (sa === sid) {
                        console.log(name);
                        resolve(name); // Resolve the promise with the name
                    }
                });
                // If the sid is not found, resolve with null
                resolve(null);
            }).catch((error) => {
                // Reject the promise if there's an error
                reject(error);
            });
        });
    }


    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            const userEmail = user.email.toString();
            const userna = userEmail.split('@')[0];
            const userName = user.displayName;
            photo = user.photoURL;
            document.getElementById("abc").innerHTML = userName;
            document.getElementById('us').src = photo;
    
            const viewDataBtn = document.getElementById('viewDataBtn');
            const dataContainer = document.getElementById('data-container');
    
            function reloadDataAndCreateTables() {
                db.collection(userna).get()
                    .then((querySnapshot) => {
                        dataContainer.innerHTML = ''; // Clear previous data
    
                        // Create an object to store data grouped by sid
                        const groupedData = {};
    
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            const sid = data.sid;
    
                            // If the sid is not present in groupedData, initialize it as an empty array
                            if (!groupedData[sid]) {
                                groupedData[sid] = [];
                            }
    
                            groupedData[sid].push(data);
                        });
    
                        // Iterate through groupedData and create tables for each sid
                        for (const sid in groupedData) {
                            const items = groupedData[sid];
                            const table = createTable(items,userEmail);
                            const btn = document.createElement('button');
                            btn.classList.add('custom-btn');
                            const div = document.createElement('div');
                            
                            getname(sid).then((name) => {
                                if (name !== null) {
                                    console.log("Name found:", name);
                                    div.innerHTML = `<h2>${name}</h2>`;
                                    div.appendChild(table);
                                    dataContainer.appendChild(div);
                                    btn.innerHTML = "Delete";
                                    dataContainer.appendChild(btn);
                                    
                                    // Add event listener to the button
                                    btn.addEventListener("click", function onClick() {
                                        del(sid,userna);
                                        // Reload data and recreate tables after deleting documents
                                        
                                        // Remove the event listener after clicking once
                                        btn.removeEventListener("click", onClick);

                                        setTimeout(() => reloadDataAndCreateTables(), 100)
                                        
                                    });
                                } else {
                                    console.log("Name not found.");
                                }
                            }).catch((error) => {
                                console.error("Error:", error);
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting documents: ", error);
                    });
            }
    
            viewDataBtn.addEventListener('click', () => {
                // Call the function to load data and create tables
                reloadDataAndCreateTables();
            });
        } else {
            // No user is signed in
            console.log("No user is signed in.");
        }
    });
    
    function createTable(items,userEmail) {
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        table.classList.add('custom-table');
        const f = document.createElement("thead");
        const tr=document.createElement('tr');
        tr.innerHTML=`<th>Name</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
        <th>Status</th>`;
        tbody.appendChild(tr);
        
        items.forEach((item) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name || 'N/A'}</td>
                <td>${item.qty || 'N/A'}</td>
                <td>${item.price || 'N/A'}</td>
                <td>${item.price * item.qty || 'N/A'}</td>
                <td><input type="checkbox" ${item.end ? 'checked' : ''} onclick="updateEndValue('${item.docId}', this.checked, '${userEmail}')"></td>
            `;
            tbody.appendChild(tr);
        });
    
        table.appendChild(tbody);
        return table;
    }

    
    let signOutButton = document.getElementById("signout")
signOutButton.addEventListener("click", (e) => {
  //Prevent Default Form Submission Behavior
  e.preventDefault()
  console.log("clicked")
  
  auth.signOut()
  alert("Signed Out")
  window.location = "index.html";
})

function updateEndValue(docId, isChecked,usd) {
    db.collection(usd).doc(docId).update({
        end: isChecked
    })
    .then(() => {
        console.log('End value updated successfully!');
    })
    .catch((error) => {
        console.error('Error updating end value:', error);
    });
}

async function del(sid,userna) {
    try {
      // Get a reference to the collection
      const collectionRef = firebase.firestore().collection(userna);
  
      // Get all documents in the collection
      const snapshot = await collectionRef.get();
  
      // Iterate through each document and delete it
      snapshot.forEach(async (doc) => {
        const data = doc.data();
        const sid1 = data.sid;
        if(sid1 === sid){
        await doc.ref.delete();
        }
      });
  
      console.log('All documents deleted successfully');
    } catch (error) {
      console.error('Error deleting documents:', error);
      // Handle the error, e.g., show a message to the user
    }
  }