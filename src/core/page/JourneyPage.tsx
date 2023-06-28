import Journey from "../component/Journey";

const Add: React.FC = () => {
  return <Journey.Add />;
};

const Home: React.FC = () => {
  return <Journey.List />;
};

const Edit: React.FC = () => {
  return <Journey.Edit />;
};

const JourneyPage = {
  Home,
  Add,
  Edit,
};

export default JourneyPage;
