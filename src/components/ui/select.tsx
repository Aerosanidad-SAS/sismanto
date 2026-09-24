"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

/**
 * Reimplementación de shadcn/ui Select (originalmente sobre @radix-ui/react-select)
 * como combobox buscable: mismo árbol de componentes compositivos
 * (Select > SelectTrigger > SelectValue, Select > SelectContent > SelectItem),
 * pero con clic-para-seleccionar Y filtro por texto en todos los sitios que ya
 * usan este set de componentes — sin tocar los call sites.
 */

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function nodeToText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join("")
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return nodeToText(props.children)
  }
  return ""
}

/** Recorre el árbol de children buscando <SelectItem> (incluso dentro de SelectGroup/fragmentos)
 * para construir un mapa value -> texto, sin depender de que SelectContent esté montado. */
function collectItemLabels(node: React.ReactNode, map: Map<string, string>) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === SelectItem) {
      const props = child.props as { value: string; children?: React.ReactNode }
      map.set(props.value, nodeToText(props.children))
      return
    }
    const props = child.props as { children?: React.ReactNode } | undefined
    if (props?.children) collectItemLabels(props.children, map)
  })
}

interface SelectContextValue {
  value?: string
  onValueChange?: (v: string) => void
  disabled?: boolean
  open: boolean
  setOpen: (o: boolean) => void
  search: string
  setSearch: (s: string) => void
  labelByValue: Map<string, string>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext(component: string): SelectContextValue {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error(`<${component}> debe usarse dentro de <Select>`)
  return ctx
}

interface SelectProps {
  value?: string
  onValueChange?: (v: string) => void
  disabled?: boolean
  children?: React.ReactNode
}

const Select = ({ value, onValueChange, disabled, children }: SelectProps) => {
  const [open, setOpenState] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const setOpen = React.useCallback(
    (o: boolean) => {
      if (disabled) return
      setOpenState(o)
      if (!o) setSearch("")
    },
    [disabled]
  )

  const labelByValue = React.useMemo(() => {
    const map = new Map<string, string>()
    collectItemLabels(children, map)
    return map
  }, [children])

  const ctx = React.useMemo<SelectContextValue>(
    () => ({ value, onValueChange, disabled, open, setOpen, search, setSearch, labelByValue }),
    [value, onValueChange, disabled, open, setOpen, search, labelByValue]
  )

  return (
    <SelectContext.Provider value={ctx}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </SelectContext.Provider>
  )
}

/** Sin efecto propio — agrupa visualmente vía CommandGroup dentro de SelectContent. */
const SelectGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>

const SelectValue = ({
  placeholder,
  className,
}: {
  placeholder?: string
  className?: string
}) => {
  const { value, labelByValue } = useSelectContext("SelectValue")
  const label = value ? labelByValue.get(value) ?? value : undefined
  return (
    <span className={cn("truncate", !label && "text-muted-foreground", className)}>
      {label ?? placeholder}
    </span>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, disabled, ...props }, ref) => {
  const { disabled: rootDisabled, open } = useSelectContext("SelectTrigger")
  return (
    <PopoverTrigger asChild>
      <button
        ref={ref}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={rootDisabled || disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>
    </PopoverTrigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { search, setSearch } = useSelectContext("SelectContent")
  return (
    <PopoverContent
      ref={ref}
      align="start"
      className={cn("z-50 w-[var(--radix-popover-trigger-width)] min-w-[12rem] p-0", className)}
      {...props}
    >
      <Command shouldFilter={false}>
        <CommandInput placeholder="Buscar…" value={search} onValueChange={setSearch} />
        <CommandList className="max-h-72">
          <CommandEmpty>Sin coincidencias</CommandEmpty>
          <CommandGroup>{children}</CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} />
)

interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value: itemValue, disabled, ...props }, ref) => {
    const { value, onValueChange, setOpen, search } = useSelectContext("SelectItem")
    const text = nodeToText(children)
    const q = search.trim()
    if (q && !sinAcentos(text).includes(sinAcentos(q))) return null

    return (
      <CommandItem
        ref={ref}
        value={`${itemValue}__${text}`}
        disabled={disabled}
        onSelect={() => {
          onValueChange?.(itemValue)
          setOpen(false)
        }}
        className={className}
        {...props}
      >
        <Check
          className={cn(
            "mr-2 h-4 w-4 shrink-0",
            value === itemValue ? "opacity-100" : "opacity-0"
          )}
        />
        <span className="truncate">{children}</span>
      </CommandItem>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <CommandSeparator className={className} {...props} />
)

/** No-ops — el combobox no necesita scroll buttons (CommandList ya hace overflow-y-auto). */
const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
