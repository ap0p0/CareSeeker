import { useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  downloadProviderDocument,
  type ProviderDocument,
  type ProviderDocumentCategory,
} from "../../../../../queries/provider";
import { accountSettingsPath } from "../../AccountSettings/settingsTabs";
import { formatFileSize } from "../../Register/documentOptions";
import { documentCategoryLabel } from "../labels";
import {
  MissingSection,
  OverviewCard,
} from "../../../../../components/OverviewCard";

type DocumentsCardProps = {
  documents: ProviderDocument[];
  /** Limit to some categories (e.g. certificates on the education page). */
  categories?: ProviderDocumentCategory[];
  title?: string;
  /** Inline quick edit (overview). */
  onEdit?: () => void;
};

const INLINE_VIEWABLE = new Set(["application/pdf", "image/jpeg", "image/png"]);

const DocumentsCard = ({
  documents,
  categories,
  title = "Documents",
  onEdit,
}: DocumentsCardProps) => {
  const editTo = accountSettingsPath("documents");
  const [error, setError] = useState<string | null>(null);
  const visible = categories
    ? documents.filter((document) => categories.includes(document.category))
    : documents;

  const open = async (document: ProviderDocument) => {
    setError(null);
    const inline = INLINE_VIEWABLE.has(document.mimeType);
    const tab = inline ? window.open("", "_blank") : null;
    try {
      const blob = await downloadProviderDocument(
        document.id,
        inline ? "inline" : "attachment",
      );
      const url = URL.createObjectURL(blob);
      if (tab) {
        tab.location.href = url;
      } else {
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = document.originalFilename;
        anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caught) {
      tab?.close();
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not open the document.",
      );
    }
  };

  return (
    <OverviewCard
      title={title}
      editTo={editTo}
      onEdit={onEdit}
      editLabel="Manage"
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      {visible.length === 0 ? (
        <MissingSection
          text="No documents uploaded yet."
          to={editTo}
          onAction={onEdit}
          action="Upload"
        />
      ) : (
        <List disablePadding dense>
          {visible.map((document) => (
            <ListItem
              key={document.id}
              disableGutters
              secondaryAction={
                <Tooltip title="Open">
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={`Open ${document.originalFilename}`}
                    onClick={() => void open(document)}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText
                primary={document.originalFilename}
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {documentCategoryLabel(document.category)} ·{" "}
                    {formatFileSize(document.sizeBytes)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </OverviewCard>
  );
};

export default DocumentsCard;
