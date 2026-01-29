import BestSellers from "../components/HomePage/BestSellers";
import HeaderAdvertisement from "../components/HomePage/HeaderAdvertisement";
import "./Homepage.css";
export default function Homepage(){
    return(
        <div className="homepage-container">
            <HeaderAdvertisement />
            <div className="section-divider"></div>
            <div className="homepage-layout">
                <BestSellers />
            </div>
        </div>
    )
}