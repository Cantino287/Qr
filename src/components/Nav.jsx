import 'react-toastify/dist/ReactToastify.css';
import './nav.css';

import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import { IoSearch } from 'react-icons/io5';
import { LuShoppingBag } from 'react-icons/lu';
import { MdQrCodeScanner } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import navigation hook
import { ToastContainer } from 'react-toastify';

import myIcon from '../assets/logo.png';
import { dataContext } from '../context/UserContext';

const Nav = () => {
    const navigate = useNavigate(); // Navigation function
    const { input, setInput, setCate, setShowCart } = useContext(dataContext); // Ensure that dataContext is provided
    const [tableNumber, setTableNumber] = useState(null);
    const [filteredFoodList, setFilteredFoodList] = useState([]);
    const [noResults, setNoResults] = useState(false);

    // Get the cart items from Redux store
    const items = useSelector(state => state.cart);

    // Load table number from localStorage on mount
    useEffect(() => {
        const storedTableNumber = localStorage.getItem('tableNumber');
        if (storedTableNumber) {
            setTableNumber(storedTableNumber);
        }
    }, []);
    const handleSearchChange = (e) => {
        setInput(e.target.value);
      };
    

    useEffect(() => {
        if (items && items.length > 0) {
            let newList = items.filter((item) =>
                item.name.toLowerCase().includes(input.toLowerCase())
            );
            
            setFilteredFoodList(newList); // Update the filtered list
            
            // Check if no items match and set noResults flag
            if (newList.length === 0 && input !== '') {
                setNoResults(true);
            } else {
                setNoResults(false);
            }
        }
    }, [input, items]); // Ensure useEffect depends on 'input' and 'items'



    

    // Handle Logout: Remove tableNumber & reload page
    const handleLogout = () => {
        localStorage.removeItem('tableNumber');
        localStorage.removeItem('tableLogin'); // Remove login data
        setTableNumber(null);
        window.location.reload(); // Reload to reset UI
    };

    // Navigate to QR Login page
    const handleQRClick = () => {
        navigate('/QRLogin');
    };

    return (
        
        <div className="navbar">
            {/* Logo */}
            <div className="nav-logo">
            <img src={myIcon} alt="icon" className="w-[200px] h-[30px]" />
            </div>
            {/* Search Bar */}
            <form className="nav-search" onSubmit={(e) => e.preventDefault()}>
                <IoSearch className="text-green-500 w-[20px] h-[20px]" />
                <input
                    type="text"
                    placeholder="Search Items..."
                    onChange={handleSearchChange}
                    value={input}
                />
            </form>

            {/* QR Code Scanner OR Table Number */}
            <div className="nav-qr" onClick={handleQRClick}>
                {tableNumber ? (
                    <div className="nav-table">
                        <button onClick={handleLogout}>Table {tableNumber}</button>
                    </div>
                ) : (
                    <MdQrCodeScanner className="w-[30px] h-[30px] text-green-500" />
                )}
            </div>

            {/* Cart Icon */}
            <div className="nav-cart" onClick={() => setShowCart(true)}>
                <span className="nav-cart-count">{items.length}</span>
                <LuShoppingBag className="w-[30px] h-[30px] text-green-500" />
            </div>

            <ToastContainer />
        </div>
    );
};

export default Nav;



  
