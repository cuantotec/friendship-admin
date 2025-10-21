"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ReactNode } from "react";

interface BaseFormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

interface InputFieldProps extends BaseFormFieldProps {
  type: "input";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface TextareaFieldProps extends BaseFormFieldProps {
  type: "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFormFieldProps {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

interface SwitchFieldProps extends BaseFormFieldProps {
  type: "switch";
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps | SwitchFieldProps;

export default function FormField(props: FormFieldProps) {
  const { label, id, required, error, description, className = "" } = props;

  const renderField = () => {
    switch (props.type) {
      case "input":
        return (
          <Input
            id={id}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={error ? "border-red-500" : ""}
          />
        );
      
      case "textarea":
        return (
          <Textarea
            id={id}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            rows={props.rows || 3}
            disabled={props.disabled}
            className={error ? "border-red-500" : ""}
          />
        );
      
      case "select":
        return (
          <Select
            value={props.value}
            onValueChange={props.onChange}
            disabled={props.disabled}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "switch":
        return (
          <Switch
            id={id}
            checked={props.checked}
            onCheckedChange={props.onChange}
            disabled={props.disabled}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderField()}
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
