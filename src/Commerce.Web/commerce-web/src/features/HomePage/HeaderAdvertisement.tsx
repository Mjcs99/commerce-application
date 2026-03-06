import { useNavigate } from "react-router-dom";
import salePhoto from "../../assets/salephoto.png";
import "./HeaderAdvertisement.css";
export default function HeaderAdvertisement(){
    const navigate = useNavigate();
    return (
        <div className="hero">
            <img src={salePhoto}/>
            <div className="hero-content">
                <button className="hero-button" onClick={() => navigate("/products")}>Shop Now</button>
            </div>
        </div>
    );
}