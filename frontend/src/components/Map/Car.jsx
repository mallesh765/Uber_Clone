import React from "react";
import { useNavigate } from "react-router-dom";

const data = [
  {
    id: "123",
    title: "Uber Mini",
    ratePerKm: 5, // Rate in Rs/km
    image: "https://links.papareact.com/3pn",
  },
  {
    id: "456",
    title: "Uber Max",
    ratePerKm: 10, // Rate in Rs/km
    image: "https://links.papareact.com/5w8",
  },
  {
    id: "789",
    title: "Uber Luxury",
    ratePerKm: 15, // Rate in Rs/km
    image: "https://links.papareact.com/7pf",
  },
];

const Car = ({ distance = 0, origin, destination }) => {
  const navigate = useNavigate();

  const distanceNumber = parseFloat(distance); // Ensure distance is a number

  const handleClick = (el, e) => {
    e.preventDefault();

    const loggedInUser = JSON.parse(localStorage.getItem("email")) || {};
    const userEmail = loggedInUser.email || '';
    const userName = JSON.parse(localStorage.getItem("username")) || '';

    const obj = {
      distanceNumber,
      origin,
      destination,
      ratePerKm: el.ratePerKm,
      userEmail,
      userName,
    };

    localStorage.setItem("userDetails", JSON.stringify(obj));
    navigate("/payment");
  };

  return (
    <div>
      <h5 style={{ marginTop: "30px" }}>Select the Ride</h5>
      {data.map((el) => (
        <div style={{ display: "flex", marginTop: "20px" }} key={el.id}>
          <img src={el.image} style={{ width: "70px" }} alt={el.title} />
          <div style={{ marginLeft: "10px" }}>
            <h6>{el.title}</h6>
            <p>{`Duration: ${Math.ceil(distanceNumber * 2)} mins`}</p> {/* Assuming 2 minutes per km */}
          </div>
          <p style={{ margin: "auto" }}>
            ₹ {Math.ceil(el.ratePerKm * distanceNumber)} {/* Calculate the cost specific to each car */}
          </p>
          <button
            onClick={(e) => handleClick(el, e)}
            style={{
              height: "50px",
              borderRadius: "10px",
              backgroundColor: "black",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              padding: "0px 15px",
              marginLeft: "auto",
            }}
          >
            Ride Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default Car;
