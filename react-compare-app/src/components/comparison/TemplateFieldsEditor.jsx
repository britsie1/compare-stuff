import React from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
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

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const field = newFields[index];
    newFields.splice(index, 1);
    newFields.splice(index + direction, 0, field);
    setFields(newFields);
  };

  return (
    <div>
      {showLabel && <Label>{label}</Label>}
      <p className="text-sm text-slate-500 mb-2">{description}</p>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id || index} className="flex items-center gap-2">
            {field.type === 'section' ? (
              <Input type="text" placeholder={`Section ${index + 1} (e.g., General)`} value={field.value} onChange={(e) => handleFieldChange(index, e.target.value)} className="font-bold" />
            ) : (
              <>
                <Input type="text" placeholder={`Field ${index + 1} (e.g., Price)`} value={field.value} onChange={(e) => handleFieldChange(index, e.target.value)} />
                <FieldTypeSelector value={field.fieldType} onChange={(e) => handleFieldTypeChange(index, e.target.value)} />
              </>
            )}
            <button type="button" onClick={() => moveField(index, -1)} disabled={index === 0} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
              <ArrowUp className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
              <ArrowDown className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => removeField(index)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" disabled={fields.length <= minFields}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
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
