export default function Input({ label, type = "text", placeholder, defaultValue }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} defaultValue={defaultValue} />
    </div>
  );
}
