import { LoaderCircle } from "./Icons";
export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <LoaderCircle className="spin" size={24} />
      <span>{label}</span>
    </div>
  );
}
