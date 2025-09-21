import React from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import FieldTypeSelector from './FieldTypeSelector';
import { v4 as uuidv4 } from 'uuid';

const TemplateFieldsEditor = ({
  fields,
  setFields,
  minFields = 1,
  showLabel = true,
  showAddSection = true,
  showAddField = true,
  label = 'Comparison Fields',
  description = 'Define the criteria you want to compare. At least one is required.'
}) => {
  const handleFieldChange = (index, value) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
  };


  // Removed currency handling

  const handleFieldTypeChange = (index, fieldType) => {
    const newFields = [...fields];
    newFields[index].fieldType = fieldType;
    setFields(newFields);
  };

  const addField = () => {
    setFields([...fields, { type: 'field', value: '', fieldType: 'text', id: uuidv4() }]);
  };

  const addSection = () => {
    setFields([...fields, { type: 'section', value: '', id: uuidv4() }]);
  };

  const removeField = (index) => {
    if (fields.length > minFields) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };


  // Drag and drop reorder
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newFields = Array.from(fields);
    const [removed] = newFields.splice(result.source.index, 1);
    newFields.splice(result.destination.index, 0, removed);
    setFields(newFields);
  };


  // Removed currency options

  return (
    <div className="p-0 sm:p-0"> {/* Remove modal padding for mobile friendliness */}
      {showLabel && <Label>{label}</Label>}
      <p className="text-sm text-slate-500 mb-2">{description}</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields-list">
          {(provided) => (
            <div
              className="space-y-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {fields.map((field, index) => (
                <Draggable key={field.id || index} draggableId={String(field.id || index)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 w-full"
                      style={{ ...provided.draggableProps.style, touchAction: 'manipulation' }}
                    >
                      <span {...provided.dragHandleProps} className="cursor-grab text-slate-400 hover:text-indigo-600 p-1 flex-shrink-0">
                        <GripVertical className="h-5 w-5" />
                      </span>
                      {field.type === 'section' ? (
                        <Input type="text" placeholder={`Section ${index + 1} (e.g., General)`} value={field.value} onChange={(e) => handleFieldChange(index, e.target.value)} className="font-bold flex-1 min-w-0" />
                      ) : (
                        <>
                          <Input type="text" placeholder={`Field ${index + 1} (e.g., Price)`} value={field.value} onChange={(e) => handleFieldChange(index, e.target.value)} className="flex-1 min-w-0" />
                          <div className="flex-shrink-0 w-28">
                            <FieldTypeSelector value={field.fieldType} onChange={(e) => handleFieldTypeChange(index, e.target.value)} />
                          </div>
                        </>
                      )}
                      <button type="button" onClick={() => removeField(index)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors flex-shrink-0" disabled={fields.length <= minFields}>
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="flex gap-2 mt-3 flex-wrap">
        {showAddField && (
          <Button type="button" onClick={addField} variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Add Field
          </Button>
        )}
        {showAddSection && (
          <Button type="button" onClick={addSection} variant="secondary">
            <Plus className="mr-2 h-4 w-4" /> Add Section
          </Button>
        )}
      </div>
    </div>
  );
};

export default TemplateFieldsEditor;
