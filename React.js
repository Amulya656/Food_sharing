import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
const Button = ({ children, onClick }) => <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClick}>{children}</button>;
const Input = ({ ...props }) => <input className="border p-2 rounded w-full" {...props} />;
const Select = ({ children, ...props }) => <select className="border p-2 rounded w-full" {...props}>{children}</select>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

const LoginPage = ({ setUserType }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registeredUsers ] = useState(JSON.parse(localStorage.getItem("users")) || []);
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = registeredUsers.find((u) => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      navigate("/select-role");  // Redirect to role selection after login
    } else {
      alert("Invalid username or password!");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold">Login</h2>
      <input className="border p-2 my-2" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="border p-2 my-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded my-2" onClick={handleLogin}>Login</button>
      <p className="mt-5">Don't have an account? <button className="bg-blue-500 text-white px-4 py-2 rounded my-2" onClick={() => navigate("/register")}>Register</button></p>
    </div>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users")) || []);
  const navigate = useNavigate();

  const sendOTP = () => {
    if (mobile.length === 10) {
      setOtp("1234");
      alert("OTP Sent: 1234 (For Demo)");
    } else {
      alert("Enter a valid 10-digit mobile number!");
    }
  };

  const verifyOTP = () => {
    if (otp === "1234") {
      setVerified(true);
      alert("Mobile Verified!");
    } else {
      alert("Invalid OTP!");
    }
  };

  const handleRegister = () => {
    if (!verified) return alert("Verify your mobile number first!");
    const newUser = { name, mobile, username, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    alert("Registration Successful! Please Login.");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold">Register</h2>
      <input className="border p-2 my-2" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border p-2 my-2" type="text" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
      {!verified ? (
        <>
          <button className="bg-green-500 text-white px-4 py-2 rounded my-2" onClick={sendOTP}>Send OTP</button>
          <input className="border p-2 my-2" type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button className="bg-blue-500 text-white px-4 py-2 rounded my-2" onClick={verifyOTP}>Verify OTP</button>
        </>
      ) : (
        <>
          <input className="border p-2 my-2" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="border p-2 my-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-blue-500 text-white px-4 py-2 rounded my-2" onClick={handleRegister}>Register</button>
        </>
      )}
    </div>
  );
};

const RoleSelectionPage = ({ setUserType }) => {
  const navigate = useNavigate();

  const selectRole = (role) => {
    setUserType(role);
    localStorage.setItem("userType", role);
    navigate(role === "donor" ? "/donor" : "/receiver");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold">Select Your Role</h2>
      <button className="bg-green-500 text-white px-4 py-2 rounded my-2" onClick={() => selectRole("donor")}>I'm a Donor</button>
      <button className="bg-orange-500 text-white px-4 py-2 rounded my-2" onClick={() => selectRole("receiver")}>I'm a Receiver</button>
    </div>
  );
};

const CountdownTimer = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiry) - new Date();
      return difference > 0
        ? {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          }
        : null;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  if (!timeLeft) return <span className="text-red-500">Expired</span>;

  return (
    <div className="text-green-500">
      Expires in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
};




const DonorDashboard = () => {
  const [foodList, setFoodList] = useState(JSON.parse(localStorage.getItem("foodList")) || []);
  const [food, setFood] = useState({ name: "", image: "", quantity: "", address: "", category: "veg", expiry: ""  });
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    setRequests(JSON.parse(localStorage.getItem("foodRequests")) || []);
  }, []);
  
  useEffect(() => {
    const now = new Date();
    const updatedFoodList = foodList.filter((item) => new Date(item.expiry) > now);
  
    if (updatedFoodList.length !== foodList.length) {
      localStorage.setItem("foodList", JSON.stringify(updatedFoodList));
      setFoodList(updatedFoodList);
    }
  }, [foodList]);
  

  // Function to add food item
  const addFoodItem = () => {
    const updatedFoodList = [...foodList, food];
    setFoodList(updatedFoodList);
    localStorage.setItem("foodList", JSON.stringify(updatedFoodList)); // Save to localStorage
    setFood({ name: "", image: "", quantity: "", address: "", category: "veg" });
  };

  // Function to remove a food item
  const removeFoodItem = (index) => {
    const updatedFoodList = [...foodList];
    updatedFoodList.splice(index, 1);
    setFoodList(updatedFoodList);
    localStorage.setItem("foodList", JSON.stringify(updatedFoodList)); // Update localStorage
  };
  const acceptRequest = (index) => {
    const acceptedRequest = requests[index];

    // Remove item from foodList
    const updatedFoodList = foodList.filter((item) => item.name !== acceptedRequest.name);
    localStorage.setItem("foodList", JSON.stringify(updatedFoodList));
    setFoodList(updatedFoodList);

    // Move request to accepted orders
    const myOrders = JSON.parse(localStorage.getItem("myOrders")) || [];
    myOrders.push(acceptedRequest);
    localStorage.setItem("myOrders", JSON.stringify(myOrders));

    // Remove from request list
    const updatedRequests = [...requests];
    updatedRequests.splice(index, 1);
    localStorage.setItem("foodRequests", JSON.stringify(updatedRequests));
    setRequests(updatedRequests);

    alert("Request accepted! Food has been assigned to the receiver.");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Donor Dashboard</h2>

      {/* Add Food Section */}
      <div className="grid gap-4 border p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">Add Food for Donation</h3>
        <Input placeholder="Food Name" value={food.name} onChange={(e) => setFood({ ...food, name: e.target.value })} />
        <Input placeholder="Image URL" value={food.image} onChange={(e) => setFood({ ...food, image: e.target.value })} />
        <Input placeholder="Quantity" value={food.quantity} onChange={(e) => setFood({ ...food, quantity: e.target.value })} />
        <Input placeholder="Address" value={food.address} onChange={(e) => setFood({ ...food, address: e.target.value })} />
        <Input type="datetime-local" value={food.expiry} onChange={(e) => setFood({ ...food, expiry: e.target.value })} />
        <Select onChange={(e) => setFood({ ...food, category: e.target.value })}>
          <SelectItem value="veg">Veg</SelectItem>
          <SelectItem value="non-veg">Non-Veg</SelectItem>
        </Select>
        <Button className="add-food-btn" onClick={addFoodItem}>Add Food</Button>
      </div>

      {/* My Food Listings Section */}
      <h3 className="text-xl font-bold mt-6">My Food Listings</h3>
      {foodList.length === 0 ? (
        <p>No food items added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foodList.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg shadow">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
              <h3 className="font-bold mt-2">{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Category: {item.category}</p>
              <p><strong>Address:</strong> {item.address}</p>
              <button className="bg-red-500 text-white px-4 py-2 mt-2" onClick={() => removeFoodItem(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <h3 className="text-xl font-bold mt-4">Food Requests</h3>
      {requests.length === 0 ? <p>No requests yet.</p> : (
        requests.map((req, index) => (
          <div key={index} className="border p-4">
            <p><strong>Request for:</strong> {req.name} ({req.quantity})</p>
            <p><strong>Requested by:</strong> {req.receiver}</p>
            <button className="bg-green-500 text-white px-4 py-2 mt-2" onClick={() => acceptRequest(index)}>
              Accept Request
            </button>
          </div>
        ))
      )}
    </div>
  );
};





const ReceiverDashboard = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [foodList, setFoodList] = useState([]);

  useEffect(() => {
    // Fetch donated food items from localStorage
    const storedFood = JSON.parse(localStorage.getItem("foodList")) || [];
    setFoodItems(storedFood);
  }, []);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  useEffect(() => {
    const storedFood = JSON.parse(localStorage.getItem("foodList")) || [];
    setFoodList(storedFood);
  }, []);

  // Effect to remove expired food items
  useEffect(() => {
    const now = new Date();

    // Remove expired items
    const updatedFoodList = foodList.filter((item) => new Date(item.expiry) > now);

    // Check if any items were removed
    if (updatedFoodList.length !== foodList.length) {
      localStorage.setItem("foodList", JSON.stringify(updatedFoodList));

      // Update state
      setFoodList(updatedFoodList);
    }
  }, [foodList]); 
  

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Available Food Items</h2>

      {/* Show message if no food is available */}
      {foodItems.length === 0 ? (
        <p>No food items available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodItems.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg shadow">
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />
              <h3 className="font-bold mt-2">{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Category: {item.category}</p>
              <p><strong>Donor's Address:</strong> {item.address}</p>
              {item.expiry && <CountdownTimer expiry={item.expiry} />}
              <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigate to Cart */}
      <button className="bg-green-500 text-white px-4 py-2 mt-4" onClick={() => navigate("/cart")}>
        Review Cart
      </button>
      <button className="bg-blue-500 text-white px-4 py-2 mt-4" onClick={() => navigate("/orders")}>View My Orders</button>
    </div>
  );
};



const CartPage = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(
    JSON.parse(localStorage.getItem("foodRequests")) || []
  );

  const requestFood = (item) => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      alert("Please log in to request food.");
      return;
    }

    const newRequest = {
      name: item.name,
      quantity: item.quantity,
      receiver: loggedInUser.username,
    };

    const updatedRequests = [...requests, newRequest];
    setRequests(updatedRequests);
    localStorage.setItem("foodRequests", JSON.stringify(updatedRequests));

    // Remove item from cart after requesting
    setCart(cart.filter((cartItem) => cartItem.name !== item.name));

    alert("Food request sent!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map((item, index) => (
          <div key={index} className="border p-4 m-2">
            <h3 className="font-bold">{item.name}</h3>
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover my-2" />
            <p>Quantity: {item.quantity}</p>
            <p>Category: {item.category}</p>
            <p>Address: {item.address}</p>
            <button className="bg-red-500 text-white px-4 py-2 mt-2" onClick={() => setCart(cart.filter((_, i) => i !== index))}>
              Remove
            </button>
            <button className="bg-green-500 text-white px-4 py-2 mt-2 ml-2" onClick={() => requestFood(item)}>
              Request Food
            </button>
          </div>
        ))
      )}

      <button className="bg-blue-500 text-white px-4 py-2 mt-4" onClick={() => navigate("/receiver")}>
        Back to Food Listings
      </button>
    </div>
  );
};



const OrdersPage = () => {
  const [orders ] = useState(JSON.parse(localStorage.getItem("myOrders")) || []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order, index) => (
            <div key={index} className="border p-4 rounded-lg shadow">
              <h3 className="font-bold">{order.name}</h3>
              <p>Quantity: {order.quantity}</p>
              <p>Received from Donor</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};




const App = () => {
  const [userType, setUserType] = useState(localStorage.getItem("userType") || null);
  const [cart, setCart] = useState([]);
  const [donatedItems, setDonatedItems] = useState(
    JSON.parse(localStorage.getItem("donatedItems")) || []
  );

  useEffect(() => {
    localStorage.setItem("donatedItems", JSON.stringify(donatedItems));
  }, [donatedItems]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setUserType={setUserType} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-role" element={<RoleSelectionPage setUserType={setUserType} />} />
        <Route path="/donor" element={userType === "donor" ? <DonorDashboard setDonatedItems={setDonatedItems} donatedItems={donatedItems} /> : <Navigate to="/" />} />
        <Route path="/receiver" element={userType === "receiver" ? <ReceiverDashboard donatedItems={donatedItems} cart={cart} setCart={setCart} /> : <Navigate to="/" />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </Router>
  );
};




export default App;
