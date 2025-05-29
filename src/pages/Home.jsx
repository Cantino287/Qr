import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { RxCross2 } from 'react-icons/rx';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
// import { useHistory } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Categories from '../Category';  // Import Categories component
import Card from '../components/Card';
import Card2 from '../components/Card2';
import Nav from '../components/Nav';
import { dataContext } from '../context/UserContext';
// import { clearCart } from '../redux/actions/cartActions';
import { clearCart } from '../redux/cartSlice';

// import { clearCart } from '../redux/cart/cartActions';

const Home = () => {
  // const navigate = useNavigate();
  const { input } = useContext(dataContext);
  let { Cate, setCate, showCart, setShowCart } = useContext(dataContext);
  const [categories, setCategories] = useState({});
  const [category, setCategory] = useState("All");
  const [foodList, setFoodList] = useState([]);
  const [filteredFoodList, setFilteredFoodList] = useState([]);
  const [shopName, setShopName] = useState("");
  const allItems = useSelector(state => state.cart); // or your full item list
  const [filteredItems, setFilteredItems] = useState([]);

  // const [foodList, setFoodList] = useState([]);
  // const [categories, setCategories] = useState([]);
  // const [filteredFoodList, setFilteredFoodList] = useState([]);
  // const [currentCategory, setCurrentCategory] = useState(null);
  const [currentCategory, setCurrentCategory] = useState("All");

  const cart = useSelector((state) => state.cart);
  const [orderType, setOrderType] = useState("EatInShop");
  const [email, setEmail] = useState('');






  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const shopId = localStorage.getItem("shopId");
  let tableNumber = localStorage.getItem("tableNumber");


  useEffect(() => {
    const fetchCat = () => {
      fetch("https://cantino.onrender.com/category/get", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          const categoryMap = {};
          data.forEach((cat) => {
            categoryMap[cat.name] = cat.id;
          });
          setCategories(categoryMap);
        })
        .catch((error) => console.error("❌ Error fetching categories:", error));
    };

    fetchCat();
    const intervalId = setInterval(fetchCat, 10000); // every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchMenu = () => {
      fetch(`https://cantino.onrender.com/product/shop/${shopId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const products = Array.isArray(data.products) ? data.products : data;
          setFoodList(products);
        })
        .catch((error) => console.error("❌ Error fetching food:", error));
    };

    fetchMenu();
    const intervalId = setInterval(fetchMenu, 5000); // every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Filter food list based on selected category
  useEffect(() => {
    if (!Array.isArray(foodList)) {
      console.warn("⚠️ foodList is not an array:", foodList);
      setFilteredFoodList([]);
      return;
    }

    if (!category || category === "All") {
      setFilteredFoodList(foodList);
      return;
    }

    const categoryId = categories[category];
    if (!categoryId) {
      setFilteredFoodList([]);
      return;
    }

    const filtered = foodList.filter((item) => item.categoryId === categoryId);
    setFilteredFoodList(filtered);
  }, [category, foodList, categories]);

  const handleTabClick = (tab) => {
    setCategory(tab);
  };

  useEffect(() => {
    const shopId = localStorage.getItem("shopId");

    if (shopId) {
      axios
        .get(`https://cantino.onrender.com/shop/shop-name/${shopId}`)
        .then((res) => setShopName(res.data))
        .catch((err) => console.error("Error fetching shop name:", err));
    }
  }, []);

  // ----------------------------------------------------

  useEffect(() => {
    // Fetch or load your full food list into foodList state
    fetch('/api/food')  // example fetch, replace with your actual fetch
      .then((res) => res.json())
      .then((data) => setFoodList(data));
  }, []);

  useEffect(() => {
    let updatedList = [...foodList];

    // 1️⃣ Apply category filter
    if (category !== 'All') {
      updatedList = updatedList.filter(
        (item) => item.food_category_id === category
      );
    }

    // 2️⃣ Apply search filter
    if (input.trim() !== '') {
      updatedList = updatedList.filter((item) =>
        item.name.toLowerCase().includes(input.toLowerCase())
      );
    }

    setFilteredItems(updatedList);
  }, [foodList, input, category]);

  const placeOrder = async () => {
    const tableNumber = localStorage.getItem("tableNumber");
    const shopId = localStorage.getItem("shopId");


    if (!tableNumber) {
      toast.error("Table number is missing!");
      return;
    }

    // Ensure the cart is not empty
    if (!items || items.length === 0) {
      toast.error("Cart is empty! Please add items to the cart.");
      return;
    }

    // Prepare orderedProductNames and quantities
    const orderedProductNames = items.map(item => item.name);
    const quantity = items.map(item => item.qty);
    const price = items.map(item => item.price);

    // Calculate total price
    const totalPrice = items.reduce((total, item) => total + (item.price * item.qty), 0);

    // Construct orderDetails
    const orderDetails = {
      tableNumber: parseInt(tableNumber),
      orderedProductNames: orderedProductNames,
      quantity: quantity,
      price: price,
      totalPrice: totalPrice,
      shopId: parseInt(shopId),
      orderType: orderType, // ✅ Add this line
      email: email, // ✅ Include this line
    };

    try {
      const response = await fetch("https://cantino.onrender.com/orders/placeOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const text = await response.text(); // Get raw string
      const data = JSON.parse(text); // Parse manually

      toast.success(
        <div>
          <strong>{data.message || "Order placed successfully!"}</strong> <br />
          Auto log out in 3s...
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );

      setTimeout(() => {
        dispatch(clearCart()); // Clear cart after order placement
        setShowCart(false);

        // localStorage.removeItem("token");
        localStorage.removeItem("tableNumber");
        // localStorage.getItem("shopId");


        // Refresh the page
        window.location.reload();
      }, 3000); // Delay refresh by 2 seconds (2000 ms)


    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order.");
    }
  };






  // let shopId = localStorage.getItem("shopId");

  // let token = localStorage.getItem("token");


  let items = useSelector((state) => state.cart);



  let subtotal = items.reduce((total, item) => total + item.qty * item.price, 0);
  let total = Math.floor(subtotal); // Rounded subtotal

  // Calculate tax (5%)
  const tax = Math.round(total * 0.05);

  // Net total = subtotal + tax
  const netTotal = total + tax;





  return (
    <div className="bg-slate-200 w-full min-h-screen">
      <Nav />
      <div className="section-header text-center mb-4">
        <h2 className="custom-heading text-gray-500 mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          OUR MENU
        </h2>
        <p className="text-4xl font-bold text-gray-500">
          Check <strong className="font-extrabold text-gray-700 ">{shopName || "Selected Shop"}</strong>'s{' '}
          <span className=" decoration-gray-400">Menu</span>
        </p>
      </div>


      {!input && (
        <div className="flex justify-center items-center pt-6">
          <Categories
            categories={categories}
            selectedCategory={category}
            onTabClick={handleTabClick}
          />
        </div>
      )}

      <div className="w-full flex flex-wrap gap-5 px-5 justify-center items-center pt-8 pb-8">

        {
          (filteredItems && filteredItems.length > 0
            ? filteredItems
            : input !== ''
              ? []
              : filteredFoodList && filteredFoodList.length > 0
                ? filteredFoodList
                : []
          ).length > 0 ? (
            (filteredItems && filteredItems.length > 0 ? filteredItems : filteredFoodList).map((item) => (
              <Card
                key={item.id}
                name={item.name}
                image={`https://cantino.onrender.com/images/product-images/${item.image}`}
                price={item.price}
                id={item.id}
                type={item.type}
                food_category_id={item.food_category_id}
              />
            ))
          ) : (
            <div className="text-center text-2xl text-green-500 font-semibold pt-5">
              No Menu Found!!
            </div>
          )
        }

      </div>
      {/* </div> */}


      {/* Cart Drawer */}
      <div className={`w-full md:w-[40vw] h-[100%] fixed top-0 right-0 bg-white shadow-xl p-6 transition-all duration-500 flex flex-col items-center overflow-auto ${showCart ? "translate-x-0" : "translate-x-full"}`}>
        <header className='w-[100%] flex justify-between items-center'>
          <span className='text-green-400 text-[18px] font-semibold'>Order Items</span>
          <RxCross2 className='w-[30px] h-[30px] text-green-400 text-[18px] font-semibold cursor-pointer hover:text-gray-600' onClick={() => setShowCart(false)} />
        </header>

        {items.length > 0 ? <div className='w-full mt-9 flex flex-col gap-8'>
          {items.map((item) => (
            <Card2 key={item.id} name={item.name} price={item.price} image={item.image} id={item.id} qty={item.qty} />
          ))}</div> : <div className='text-center text-2xl text-green-500 font-semibold pt-5'>Empty Cart</div>}

        <div className='w-full border-t-2 border-b-2 border-gray-400 mt-7 flex flex-col gap-4 p-8'>
          <div className='w-full flex justify-between items-center'>
            <span className='text-lg text-gray-600 font-semibold'>Table_Number {tableNumber}</span>
            <span className='text-green-400 font-semibold text-lg'></span>
          </div>
          <div className='w-full flex justify-between items-center'>
            <span className='text-lg text-gray-600 font-semibold'>

              {items.map((item) => (<div>{item.name}</div>))}
            </span>
            {/* {categories.map((item) => ( */}
            <span className='text-green-400 font-semibold text-lg'>

              {items.map((item) => (<div>x {item.qty}</div>))}
            </span>
          </div>
          {/* <div className='w-full flex justify-between items-center'>
            <span className='text-lg text-gray-600 font-semibold'>Taxes</span>
            <span className='text-green-400 font-semibold text-lg'>Kyat-/{taxes}</span>
          </div> */}
        </div>

        <div className="w-full p-9 flex flex-col gap-4 border-b-2 border-gray-400">
          {/* Tax */}
          <div className="flex justify-between items-center">
            <span className="text-2xl text-gray-600 font-semibold">Tax ( 5% )</span>
            <span className="text-green-400 font-semibold text-2xl">{tax} Ks</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-2xl text-gray-600 font-semibold">Total</span>
            <span className="text-green-400 font-semibold text-2xl">{netTotal} Ks</span>
          </div>
        </div>
        {/* <div className='w-full border-t-2 border-b-2 border-gray-400 mt-7 flex flex-col gap-4 p-8'> */}



        <div className="w-full flex flex-wrap justify-between items-center gap-6 px-9 py-6">
          {/* Order Type Selection */}
          <div className="flex gap-10 items-center text-xl text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="EatInShop"
                className="form-radio w-5 h-5 text-green-500"
                checked={orderType === "EatInShop"}
                onChange={() => setOrderType("EatInShop")}
              />
              Eat in Shop
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="TakeAway"
                className="form-radio w-5 h-5 text-green-500"
                checked={orderType === "TakeAway"}
                onChange={() => setOrderType("TakeAway")}
              />
              Take Away
            </label>
          </div>

          {/* Email Input */}
          <div className="w-full flex justify-center items-center py-6">
            <div className="flex flex-col items-center">
              <label className="text-xl text-gray-700 mb-2 font-semibold">Enter Gmail to get INVOICE</label>
              <input
                type="email"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border border-gray-300 rounded-xl text-lg w-[300px]"
                required
              />
            </div>
          </div>

        </div>


        {/* <button className='w-[80%] p-3 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-all' onClick={(placeOrder) => {
          toast.success("Order Placed");
        }}>Place Order</button>
         */}

        <button className='w-[80%] p-3 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-all' onClick={placeOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
}

export default Home 
