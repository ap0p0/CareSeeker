import CareRequestsListPage from "./CareRequestsListPage";

const CareRequestsActive = () => (
  <CareRequestsListPage
    title="Active jobs"
    description="View care requests you have accepted and are currently fulfilling."
    filter="active"
  />
);

export default CareRequestsActive;
