import { report_t, report_view_t } from "@/types";
import { formatDate } from "@/utils";
import { Dispatch, SetStateAction } from "react";
import { Table, Button } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa";

export type ReportsTableProps = {
  reports: report_view_t[];
  onView: (report: report_view_t) => void;
  onDelete: (report: report_view_t) => void;
  setSelId: Dispatch<SetStateAction<number>>;
  privileges?: boolean,
};

export const ReportsTable = ({
  reports,
  onView,
  onDelete,
  setSelId,
  privileges
}: ReportsTableProps) => {
  const fields = [
    "ID",
    "Fecha",
    "Cliente",
    "Acciones",
  ];

  return (
    <div className="table-responsive">
      <Table striped bordered hover className="align-middle shadow-sm">
        <thead className="table-light">
          <tr>
            {fields.map((field, id) => (
              <th key={id}>{field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{formatDate(new Date(report.created_at))}</td>
              <td>{report.user_name}</td>
              <td className="text-center">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-1"
                  onClick={() => onView(report)}
                >
                  <FaEye />
                </Button>
                { privileges && (<Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {setSelId(report.id); onDelete(report)}}
                >
                  <FaTrash />
                </Button>)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
