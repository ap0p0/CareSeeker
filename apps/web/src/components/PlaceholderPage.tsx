type Props = { title: string };

const PlaceholderPage = ({ title }: Props) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>This page is coming soon.</p>
    </div>
  );
};
export default PlaceholderPage;
