import HeaderAdvertisement from "../components/HomePage/HeaderAdvertisement";
import "./Homepage.css";

export default function Homepage() {
  return (
    <div className="homepage">
      <HeaderAdvertisement />

      <section className="underHero">
        <div className="underHeroInner">
          <div className="trustRow">
            <span><strong>Free</strong> returns</span>
            <span>Secure checkout</span>
            <span>Ships Canada-wide</span>
          </div>
        </div>
      </section>
    </div>
  );
}
