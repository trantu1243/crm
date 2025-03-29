import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCopy } from "@fortawesome/free-solid-svg-icons";
import CopyToClipboard from "react-copy-to-clipboard";

const SortableItem = ({ id, item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    console.log(transform);
    console.log(transition)
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 200ms ease",
        padding: "10px",
        margin: "5px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(item.content);
            alert("Copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy text: ", error);
        }
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div className="widget-content p-0">
                <div className="widget-content-wrapper">
                    <div
                        {...attributes}
                        {...listeners}
                        className="ps-2 pe-2 me-1"
                        style={{
                            cursor: "grab",
                            padding: "5px",
                            borderRadius: "5px",
                        }}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <div className="widget-content-left">
                        <div className="widget-heading" style={{color: 'black'}}>
                            {item.title}
                        </div>
                        <div className="widget-subheading">
                            {item.content.length > 50 ? item.content.slice(0, 50) + "..." : item.content}
                        </div>
                    </div>
                    
                    <div className="widget-content-right" >
                        <Button type="button" color="primary" onClick={handleCopy}>
                            <FontAwesomeIcon icon={faCopy} />
                        </Button>
                    </div>
                   
                </div>
            </div>
        </div>
    );
};

export default SortableItem;
