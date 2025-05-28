import React, {
  createContext,
  useState,
} from 'react';

// import { food_items } from '../food'
export const dataContext = createContext()

export const DataProvider = ({ children }) => {
  const [input, setInput] = useState('');    // for search bar input
  const [category, setCategory] = useState('All'); // for selected category
  const [showCart, setShowCart] = useState(false); // cart visibility

  return (
    <dataContext.Provider
      value={{
        input,
        setInput,
        category,
        setCategory,
        showCart,
        setShowCart,
      }}
    >
      {children}
    </dataContext.Provider>
  );
};
function UserContext({children}){
    // let [ Cate, setCate] = useState(food_items)
    let [input,setInput] = useState("")
    let [ showCart, setShowCart ] = useState(false)
    let data= {
        input,
        setInput,
        // Cate,
        // setCate,
        showCart,
        setShowCart
    }
  return (
    <div>
        <dataContext.Provider value={data}>
        {children}
        </dataContext.Provider>
    </div>
  )
}

export default UserContext