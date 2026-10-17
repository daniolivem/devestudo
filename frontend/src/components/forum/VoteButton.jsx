export default function VoteButton({ count = 0, hasVoted = false, compact = false, inline = false, onClick, label = "upvotes" }) {
  const classes = ["vote-button"];

  if (compact) classes.push("vote-button--compact");
  if (inline) classes.push("vote-button--inline");
  if (hasVoted) classes.push("vote-button--voted");

  return (
    <button className={classes.join(" ")} type="button" disabled={hasVoted} onClick={onClick}>
      ▲
      <strong>{count}</strong>
      {hasVoted ? <span>Votado</span> : label}
    </button>
  );
}
