import CareRequestsListPage from "./CareRequestsListPage";

const CareRequestsCompleted = () => (
  <CareRequestsListPage
    title="Completed jobs"
    description="Review your completed care requests and job history."
    filter="completed"
  />
);

export default CareRequestsCompleted;
