import salePhoto from "../../assets/salephoto.png";
import "./HeaderAdvertisement.css";
export default function HeaderAdvertisement(){
    return (
        <div className="hero">
            <img src={salePhoto}/>
        </div>
    );
}